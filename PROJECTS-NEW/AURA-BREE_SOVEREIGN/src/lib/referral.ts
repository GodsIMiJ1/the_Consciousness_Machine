export function getReferralCode() {
  let code = localStorage.getItem("ab_ref");
  if (!code) {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem("ab_ref", code);
  }
  return code;
}

export function getInviteLink(code: string) {
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
}

export function trackReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode) {
    localStorage.setItem('ab_referred_by', refCode);
    // Clean URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

export function getReferredBy() {
  return localStorage.getItem('ab_referred_by');
}
