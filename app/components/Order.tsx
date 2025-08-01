"use client";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Label,
  Input,
  Button,
} from "@/app/Components";
import { Package } from "@/app/types";

type OrderProps = {
  selectedPackage: Package;
  customizations: Record<string, any>;
  totalPrice: number;
  formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoBack: () => void;
};

export default function Order({
  selectedPackage,
  customizations,
  totalPrice,
  formData,
  onInputChange,
  onSubmit,
  onGoBack,
}: OrderProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold mb-4">
          Submit Your Order
        </CardTitle>
        <CardDescription>
          <table className="mb-3 text-left text-base">
            <tbody>
              <tr>
                <th className="pr-2 font-bold">Package:</th>
                <td className="text-gray-600">{selectedPackage?.name}</td>
              </tr>
              {Object.entries(customizations).map(([t, i]) => (
                <tr key={t}>
                  <th className="pr-2 font-bold">{t}:</th>
                  <td className="text-gray-600">{i.NAME || i.COLLECTION}</td>
                </tr>
              ))}
              <tr>
                <th className="pr-2 font-bold">Total:</th>
                <td className="text-gray-600">${totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="block w-3/4 mx-auto mt-8"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Schedule a Call
          </Button>
          <Button
            onClick={onGoBack}
            className="block w-3/4 mx-auto mt-6"
            variant="outline"
            size="lg"
          >
            Go Back
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
