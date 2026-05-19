export const SERVICE_PORTS = {
  GATEWAY: 3011,
  AUTH: 3012,
  BENEFICIARY: 3013,
  APPROVALS: 3014,
  ANALYTICS: 3015,
  ANALYTICS_TCP: 3016,
};

export const JWT_SECRET = process.env.JWT_SECRET || "hopecard-admin-secret-key-change-in-production";
