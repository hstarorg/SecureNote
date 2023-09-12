export async function gatewayRequest(action: string, data: any) {
  return fetch(`/api/gateway?action=${action}`, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ action, data }),
  })
    .then((res) => res.json())
    .then((resData) => {
      if (resData.success !== true) {
        return Promise.reject(resData);
      }
      return resData;
    });
}
