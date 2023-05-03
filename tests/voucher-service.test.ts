import voucherRepository from "repositories/voucherRepository";
import { createFakeVoucher } from "./voucher-factory";
import voucherService from "services/voucherService";

describe("VoucherService", () => {
  describe("createVoucher", () => {
    it("should throw conflict error is voucher already exists", () => {
      const code = "AAAA";
      const discount = 10;
      const voucher = createFakeVoucher();

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);
      jest
        .spyOn(voucherRepository, "createVoucher")
        .mockImplementationOnce((): any => true);

      const response = voucherService.createVoucher(code, discount);

      expect(response).rejects.toEqual({
        type: "conflict",
        message: "Voucher already exist.",
      });
    });

    it("should return nothing if voucher is created", () => {
      const code = "AAAA";
      const discount = 10;

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockResolvedValueOnce(undefined);

      const response = voucherService.createVoucher(code, discount);

      expect(response).resolves.toEqual(undefined);
    });
  });

  describe("applyVoucher", () => {
    it("should throw conflict error if voucher does not exist", () => {
      const code = "AAAA";
      const amount = 100;

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockResolvedValueOnce(undefined);

      const response = voucherService.applyVoucher(code, amount);

      expect(response).rejects.toEqual({
        type: "conflict",
        message: "Voucher does not exist.",
      });
    });

    it("should return no discounted value if amount is not enought ", () => {
      const code = "AAAA";
      const amount = 90;

      const voucher = createFakeVoucher({ code });

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      jest
        .spyOn(voucherRepository, "useVoucher")
        .mockImplementationOnce((): any => false);

      const response = voucherService.applyVoucher(code, amount);

      expect(response).resolves.toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount,
        applied: false,
      });
    });

    it("should return no discounted value voucher is already used ", () => {
      const amount = 120;
      const voucher = createFakeVoucher({ used: true });

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      jest
        .spyOn(voucherRepository, "useVoucher")
        .mockImplementationOnce((): any => false);

      const response = voucherService.applyVoucher(voucher.code, amount);

      expect(response).resolves.toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount,
        applied: false,
      });
    });

    it("should return discounted value if voucher and amount is valid", () => {
      const amount = 120;
      const voucher = createFakeVoucher({ used: false });

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      jest
        .spyOn(voucherRepository, "useVoucher")
        .mockImplementationOnce((): any => false);

      const response = voucherService.applyVoucher(voucher.code, amount);

      expect(response).resolves.toEqual({
        amount,
        discount: voucher.discount,
        finalAmount: amount - amount * (voucher.discount / 100),
        applied: true,
      });
    });
  });
});
