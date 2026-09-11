export async function requestPhoneAlerts(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export async function pingPhone(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    navigator.vibrate?.([180, 70, 180, 70, 240]);
  } catch {
    /* ignore */
  }
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "reloj-btc-move",
        renotify: true,
        silent: false,
        vibrate: [180, 70, 180],
      } as NotificationOptions);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(title, { body, silent: false, tag: "reloj-btc-move" });
  } catch {
    /* blocked */
  }
}
