export default function formatError(error) {
  try {
    // Prefer normalized message set by axios interceptor
    if (error?.message && typeof error.message === 'string') return error.message;

    const detail = error?.response?.data?.detail ?? error?.response?.data ?? error?.response;

    if (!detail) return String(error || 'Unknown error');

    if (typeof detail === 'string') return detail;

    // Pydantic validation errors are arrays of objects with `msg`
    if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join('; ');

    // Objects -> try common fields then JSON
    if (typeof detail === 'object') {
      return detail.error || detail.message || JSON.stringify(detail);
    }

    return String(detail);
  } catch (e) {
    return String(error || 'Unknown error');
  }
}
