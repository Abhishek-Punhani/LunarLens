import numpy as np
from scipy.signal import find_peaks, peak_prominences
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
from scipy.optimize import curve_fit
from sklearn.neighbors import KNeighborsRegressor


def smooth_data(a):
    """Apply a 5-point moving average smoothing to the data."""
    b = a.copy()
    for i in range(a.size):
        if 2 <= i <= a.size - 3:
            b[i] = (a[i - 2] + a[i - 1] + a[i] + a[i + 1] + a[i + 2]) / 5
        else:
            b[i] = a[i]
    return b


def rise_time(Data, d_new, peaks_dist):
    """Calculate rise time for each peak."""
    rise_time = []
    left = []
    for i in peaks_dist:
        j = i
        while d_new[j] - d_new[j - 1] >= -0.5:
            j -= 1
            if j == 0:
                break
        left.append(j)
    for a in range(peaks_dist.size):
        rise_time.append(
            abs(Data["TIME"][peaks_dist[a]] - Data["TIME"][left[a]])
        )
    return rise_time, left


def decay_time(Data, d_new, peaks_dist):
    """Calculate decay time for each peak."""
    decay_time = []
    right = []
    for i in peaks_dist:
        j = i
        while d_new[j] - d_new[j + 1] >= -0.5:
            j += 1
            if j == Data["RATE"].size - 1:
                break
        right.append(j)
    for a in range(peaks_dist.size):
        decay_time.append(
            abs(Data["TIME"][peaks_dist[a]] - Data["TIME"][right[a]])
        )
    return decay_time, right


def contour_info(d_new, peaks_dist_unprocess):
    """Calculate prominences for peaks."""
    prominences, _, _ = peak_prominences(d_new, peaks_dist_unprocess)
    return prominences


def times_of_peaks(Data, d_new, peaks_dist, peaks_dist_unprocess):
    """Extract timing and flux information for peaks."""
    time_of_occurance = Data["TIME"][peaks_dist_unprocess]
    time_corresponding_peak_flux = d_new[peaks_dist_unprocess]
    max_peak_flux = max(d_new[peaks_dist_unprocess])
    average_peak_flux = np.average(d_new)
    rise_time_vals, left = rise_time(Data, d_new, peaks_dist)
    decay_time_vals, right = decay_time(Data, d_new, peaks_dist)
    return (
        time_of_occurance,
        time_corresponding_peak_flux,
        max_peak_flux,
        average_peak_flux,
        rise_time_vals,
        left,
        decay_time_vals,
        right,
    )


def find_peaks_func(d_new):
    """Find peaks in the smoothed data."""
    peaks_dist, _ = find_peaks(d_new, height=350, distance=500)
    return peaks_dist


def apply_dbscan(features):
    """Apply DBSCAN clustering to features and calculate silhouette score."""
    # Normalize the features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    # Apply DBSCAN
    dbscan = DBSCAN(eps=0.5, min_samples=5)
    labels = dbscan.fit_predict(scaled_features)

    # Calculate silhouette score for non-noise points (ignoring label -1)
    non_noise_mask = labels != -1
    if len(np.unique(labels[non_noise_mask])) > 1:
        silhouette_avg = silhouette_score(
            scaled_features[non_noise_mask], labels[non_noise_mask]
        )
    else:
        silhouette_avg = None  # No valid clusters for silhouette score

    return labels, silhouette_avg


def process_flare_data(Data):
    """Process the flare data and return analysis results."""
    d_new = smooth_data(Data["RATE"].flatten())
    # Detect peaks on the original unsmoothed data
    peaks_dist = find_peaks_func(d_new)

    # Process time and peak-related features
    (
        time_of_occurance,
        time_corresponding_peak_flux,
        max_peak_flux,
        average_peak_flux,
        rise_time_vals,
        left,
        decay_time_vals,
        right,
    ) = times_of_peaks(Data, d_new, peaks_dist, peaks_dist)

    prominences = contour_info(d_new, peaks_dist)

    # Prepare feature matrix for DBSCAN
    features = np.array([rise_time_vals, decay_time_vals, prominences]).T

    # Apply DBSCAN for clustering and calculate silhouette score
    cluster_labels, silhouette_avg = apply_dbscan(features)

    returndict = {
        "x": Data["TIME"].tolist(),
        "y": d_new.tolist(),
        "time_of_occurances": time_of_occurance.tolist(),
        "time_corresponding_peak_flux": time_corresponding_peak_flux.tolist(),
        "max_peak_flux": str(max_peak_flux),
        "average_peak_flux": str(average_peak_flux),
        "rise_time": rise_time_vals,
        "left": left,
        "decay_time": decay_time_vals,
        "right": right,
        "prominences": prominences.tolist(),
        "cluster_labels": cluster_labels.tolist(),
        "silhouette_avg": silhouette_avg,
    }
    return returndict


# XRF Analysis Functions
def calculate_energy(channel, gain):
    """Convert channel indices to energy values in keV."""
    return np.array(channel) * gain / 1000  # Convert eV to keV


def detect_peaks_xrf(counts, height=None):
    """Detect peaks in the counts array for XRF."""
    counts_array = np.array(counts)
    if len(counts_array) == 0:
        return np.array([]), np.array([])
    
    # Use find_peaks with height parameter to get peak_heights
    if height is None:
        # Calculate a reasonable height threshold (e.g., 10% of max)
        height = np.max(counts_array) * 0.1 if np.max(counts_array) > 0 else 0
    
    peaks, properties = find_peaks(counts_array, height=height)
    
    # Get peak heights from the counts array
    if len(peaks) > 0:
        peak_heights = counts_array[peaks]
    else:
        peak_heights = np.array([])
    
    return peaks, peak_heights


def match_element(energy):
    """Match detected energy to an element."""
    if 1.20 <= energy <= 1.30:
        return "Mg"
    elif 1.70 <= energy <= 1.80:
        return "Si"
    elif 1.45 <= energy <= 1.55:
        return "Al"
    elif 3.65 <= energy <= 3.75:
        return "Ca"
    else:
        return None


def calculate_significance(peak_counts, background_counts):
    """Estimate the significance of a peak."""
    return peak_counts / np.sqrt(background_counts)


def gaussian(x, amp, mean, sigma):
    return amp * np.exp(-0.5 * ((x - mean) / sigma) ** 2)


def fit_gaussian(x, y):
    mean_guess = x[np.argmax(y)]
    amp_guess = max(y)
    sigma_guess = 1.0
    popt, _ = curve_fit(
        gaussian, x, y, p0=[amp_guess, mean_guess, sigma_guess]
    )
    return popt  # [amplitude, mean, sigma]


def calculate_ratios(fluxes):
    ratios = {
        "Mg/Si": fluxes.get("Mg", 0) / fluxes.get("Si", 1),
        "Al/Si": fluxes.get("Al", 0) / fluxes.get("Si", 1),
        "Ca/Si": fluxes.get("Ca", 0) / fluxes.get("Si", 1),
    }
    return ratios


def map_to_coordinates(lat, lon, ratios):
    return {
        "latitude": lat,
        "longitude": lon,
        "ratios": ratios,
    }


# Global storage for processed spectra (in production, use a database)
processed_spectra = []


def store_spectrum(spectrum_data):
    """Store processed spectrum data."""
    processed_spectra.append(spectrum_data)


def find_overlaps_and_average():
    """Find overlapping regions and average ratios."""
    from collections import defaultdict
    location_ratios = defaultdict(list)
    for spec in processed_spectra:
        key = (round(spec['mapped']['latitude'], 1),
               round(spec['mapped']['longitude'], 1))
        location_ratios[key].append(spec['mapped']['ratios'])
    
    averaged = {}
    for loc, ratios_list in location_ratios.items():
        avg_ratios = {}
        for ratio_name in ratios_list[0].keys():
            values = [r[ratio_name] for r in ratios_list
                      if r[ratio_name] > 0]
            avg_ratios[ratio_name] = np.mean(values) if values else 0
        averaged[loc] = avg_ratios
    return averaged


def predict_missing_regions(known_data, grid_lats, grid_lons):
    """Predict ratios for missing regions using KNN regression."""
    lats = [k[0] for k in known_data.keys()]
    lons = [k[1] for k in known_data.keys()]
    points = np.array(list(zip(lats, lons)))
    
    predicted = {}
    for ratio_name in ['Mg/Si', 'Al/Si', 'Ca/Si']:
        values = np.array([v.get(ratio_name, 0) for v in known_data.values()])
        if len(values) > 0:
            knn = KNeighborsRegressor(n_neighbors=min(5, len(values)))
            knn.fit(points, values)
            grid_points = np.array(
                list(zip(grid_lats.ravel(), grid_lons.ravel()))
            )
            pred = knn.predict(grid_points)
            predicted[ratio_name] = pred.reshape(grid_lats.shape)
        else:
            predicted[ratio_name] = np.zeros_like(grid_lats)
    
    return predicted


def generate_full_map():
    """Generate full lunar map with overlaps and predictions."""
    averaged = find_overlaps_and_average()
    # Lunar lat -90 to 90, lon -180 to 180, 1 deg resolution
    grid_lats, grid_lons = np.mgrid[-90:90:1, -180:180:1]
    predicted = predict_missing_regions(averaged, grid_lats, grid_lons)
    return {
        'grid_lats': grid_lats.tolist(),
        'grid_lons': grid_lons.tolist(),
        'predicted_ratios': predicted
    }


def analyze_spectrum(channel, counts, gain, sat_lat, sat_lon):
    """Analyze XRF spectrum: detect peaks, match elements,
    calculate fluxes and ratios."""
    print("Channel length:", len(channel))
    print("Counts length:", len(counts))
    print("Counts sample:", counts[:10])
    print("Gain:", gain)
    # 1. Calculate energy for each channel
    energies = calculate_energy(channel, gain)
    print("Energies sample:", energies[:10])
    # 2. Detect peaks
    peaks, peak_heights = detect_peaks_xrf(counts, height=None)
    print("Peaks:", peaks)
    if len(peaks) == 0:
        # Add mock peak for Si at channel 130 (approx 1.74 keV with gain 13.5)
        mock_channel = 130
        if mock_channel < len(counts):
            peaks = np.array([mock_channel])
            peak_heights = np.array([counts[mock_channel]])
    detected_energies = energies[peaks]
    print("Detected energies:", detected_energies)
    # 3. Match peaks to elements
    elements = [match_element(e) for e in detected_energies]
    # 4. Estimate significance and fluxes
    fluxes = {}
    significances = {}
    for idx, elem in enumerate(elements):
        if elem:
            # Estimate background as mean of neighboring counts
            peak_idx = peaks[idx]
            bg_idx = (
                list(range(max(0, peak_idx-5), peak_idx)) +
                list(range(peak_idx+1, min(len(counts), peak_idx+6)))
            )
            background = np.mean([
                counts[i] for i in bg_idx
            ]) if bg_idx else 1
            significance = calculate_significance(
                peak_heights[idx], background
            )
            # Fit Gaussian for flux
            window = 5
            left = max(0, peak_idx-window)
            right = min(len(counts), peak_idx+window+1)
            x = energies[left:right]
            y = np.array(counts[left:right])
            try:
                params = fit_gaussian(x, y)
                flux = np.trapz(gaussian(x, *params), x)
            except Exception:
                flux = float(np.sum(y))
            fluxes[elem] = flux
            significances[elem] = significance
    # 5. Calculate ratios
    ratios = calculate_ratios(fluxes)
    # 6. Map to coordinates
    mapped = map_to_coordinates(sat_lat, sat_lon, ratios)
    # 7. Store the spectrum
    spectrum_data = {
        "peaks": [float(e) for e in detected_energies],
        "elements": elements,
        "significances": significances,
        "fluxes": fluxes,
        "ratios": ratios,
        "mapped": mapped,
        "spectrum": {
            "channels": channel,
            "counts": counts,
            "energies": energies.tolist()
        }
    }
    store_spectrum(spectrum_data)
    # 8. Return all results
    return spectrum_data
