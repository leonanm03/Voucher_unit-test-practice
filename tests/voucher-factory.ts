export function createFakeVoucher({
  id = 1,
  code = "FAKEVOUCHER",
  discount = 10,
  used = false,
} = {}) {
  return {
    id,
    code,
    discount,
    used,
  };
}
