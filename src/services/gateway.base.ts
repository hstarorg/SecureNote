export function gatewayRequest(action: string, data: any) {
  return fetch(`/api/gateway?action=${action}`, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((resData) => {
      return resData;
    });
}
