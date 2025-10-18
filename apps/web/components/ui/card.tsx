import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800 border border-gray-700 rounded-lg shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({
  children,
  className = "",
}) => <div className={`p-6 pb-0 ${className}`}>{children}</div>;

export const CardTitle: React.FC<CardProps> = ({
  children,
  className = "",
}) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({
  children,
  className = "",
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
export const CardDescription: React.FC<CardProps> = ({
  children,
  className = "",
}) => <p className={`text-sm text-gray-400 ${className}`}>{children}</p>;
