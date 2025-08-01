"use client";

import { useEffect, useState } from "react";
import { Button } from "./Components";
import { Card, CardContent, CardHeader, CardTitle } from "./Components";
import { Input } from "./Components";
import { Label } from "./Components";
import { RadioGroup, RadioGroupItem } from "./Components";
import { Select } from "./Components";
import Image from "next/image";

type BathroomType = "powder" | "master" | "shower" | "bath";
type Size = "Small" | "Medium" | "Large";
type FinishQuality = "Affordable" | "Standard" | "High-end";
type HouseType = "Condo" | "House" | "Townhouse";

export default function QuoteForm({
  step,
  onNextStep,
  onPreviousStep,
}: {
  step: number;
  onNextStep: () => void;
  onPreviousStep: () => void;
}) {
  const [bathroomType, setBathroomType] = useState<BathroomType>("powder");
  const [size, setSize] = useState<Size>("Medium");
  const [requiresPlumbing, setRequiresPlumbing] = useState(false);
  const [finishQuality, setFinishQuality] =
    useState<FinishQuality>("Affordable");
  const [houseType, setHouseType] = useState<HouseType>("House");
  const [squareFootage, setSquareFootage] = useState(40);

  const calculateQuote = (): [number, number] => {
    let basePrice = 0;
    switch (bathroomType) {
      case "powder":
        basePrice = 6000;
        break;
      case "master":
        basePrice = 17000;
        break;
      case "shower":
        basePrice = 15000;
        break;
      case "bath":
        basePrice = 13000;
        break;
    }

    if (squareFootage > 80) basePrice += 1000;
    else if (squareFootage < 40) basePrice -= 1000;

    if (requiresPlumbing) basePrice += 2000;

    switch (finishQuality) {
      case "Standard":
        basePrice += 1000;
        break;
      case "High-end":
        basePrice += 2000;
        break;
    }

    switch (houseType) {
      case "Condo":
        basePrice += 1000;
        break;
      case "Townhouse":
        basePrice += 500;
        break;
    }

    const lowerRange = Math.round((basePrice * 0.9) / 100) * 100;
    const upperRange = Math.round((basePrice * 1.1) / 100) * 100;

    return [lowerRange, upperRange];
  };

  const [lowerQuote, upperQuote] = calculateQuote();

  const handleGetExactQuote = () => {
    const subject = encodeURIComponent(
      "Request for Exact Bathroom Renovation Quote"
    );
    const body = encodeURIComponent(`
      Bathroom Type: ${bathroomType}
      Size: ${size} (${squareFootage} sq ft)
      Requires Plumbing Changes: ${requiresPlumbing ? "Yes" : "No"}
      Finish Quality: ${finishQuality}
      House Type: ${houseType}
      Estimated Quote Range: $${lowerQuote.toLocaleString()} - $${upperQuote.toLocaleString()}
      
      Please provide me with an exact quote for my bathroom renovation project.
    `);
    window.location.href = `mailto:team@cloudrenos.com?subject=${subject}&body=${body}`;
  };

  return (
    <Card
      className="w-full max-w-2xl mx-0 bg-white shadow-lg rounded-lg overflow-hidden relative"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <CardContent className="p-6 space-y-8 flex-grow h-full flex flex-col justify-between">
        {step === 1 && (
          <>
            <Label className="text-lg font-semibold text-gray-700 mt-2 mb-2 block h-10 max-w-5/6">
              What type of bathroom are you renovating?
            </Label>
            <div style={{ marginTop: 14 }}>
              <RadioGroup
                value={bathroomType}
                onValueChange={(value: BathroomType) => setBathroomType(value)}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                {["powder", "shower", "bath", "master"].map((type) => (
                  <div
                    key={type}
                    className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer w-full ${
                      bathroomType === type ? "bg-gray-300" : "bg-gray-100"
                    }`}
                    onClick={() => setBathroomType(type as BathroomType)}
                  >
                    <RadioGroupItem value={type} id={type.toLowerCase()} />
                    <Image
                      src={`/quote/${type}.png`}
                      alt={type}
                      width={50}
                      height={50}
                    />
                    {/* <Label
                      htmlFor={type.toLowerCase()}
                      className="font-medium text-gray-700 cursor-pointer"
                    >
                      {type}
                    </Label> */}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Label
              htmlFor="size"
              className="text-lg font-semibold text-gray-700 mt-2 mb-2 block h-10 max-w-5/6"
            >
              What is the size of the bathroom?
            </Label>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                marginTop: 1,
              }}
            >
              <Input
                id="size"
                type="number"
                value={squareFootage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setSquareFootage(value);
                  if (value < 20) setSize("Small");
                  else if (value > 80) setSize("Large");
                  else setSize("Medium");
                }}
                className="w-full px-4 py-12 text-center text-4xl font-bold"
                min={10}
                max={1800}
              />
              <span className="text-gray-500 text-sm absolute bottom-4 right-16">
                sq ft
              </span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Label className="text-lg font-semibold text-gray-700 mt-2 mb-2 block h-10 max-w-5/6">
              Does your bathroom require plumbing changes?
            </Label>
            <div>
              <RadioGroup
                value={requiresPlumbing ? "yes" : "no"}
                onValueChange={(value) => setRequiresPlumbing(value === "yes")}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                {["Yes", "No"].map((option) => {
                  const optionSelected =
                    option.toLowerCase() === (requiresPlumbing ? "yes" : "no");
                  return (
                    <div
                      key={option}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer w-full m-0 ${
                        optionSelected ? "bg-gray-300" : "bg-white"
                      }`}
                      onClick={() => setRequiresPlumbing(option === "Yes")}
                    >
                      <RadioGroupItem
                        value={option.toLowerCase()}
                        id={`plumbing-${option.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={`plumbing-${option.toLowerCase()}`}
                        className={`font-medium text-gray-700 cursor-pointer py-6 px-2 text-lg text-center w-full ${
                          optionSelected ? "font-semibold" : ""
                        }`}
                        style={{
                          margin: 0,
                        }}
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Label
              htmlFor="finish-quality"
              className="text-lg font-semibold text-gray-700 mt-2 mb-2 block h-10"
              style={{
                maxWidth: "95%",
              }}
            >
              Finish Quality
            </Label>
            <div
              style={{
                marginTop: 24,
              }}
            >
              <div className="border border-gray-300 rounded-lg p-2">
                <Select
                  options={[
                    {
                      key: "Affordable",
                      NAME: "Affordable",
                      PRICE: 0,
                      SKU: "AFD",
                      IMAGE: "/quote/affordable.png",
                    },
                    {
                      key: "Standard",
                      NAME: "Standard",
                      PRICE: 1000,
                      SKU: "STD",
                      IMAGE: "/quote/standard.png",
                    },
                    {
                      key: "High-end",
                      NAME: "High-end",
                      PRICE: 2000,
                      SKU: "HED",
                      IMAGE: "/quote/high-end.png",
                    },
                  ]}
                  value={finishQuality}
                  onChange={(value: string) =>
                    setFinishQuality(value as FinishQuality)
                  }
                  renderSKU={false}
                  renderDefaultImage={true}
                />
              </div>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <Label
              htmlFor="house-type"
              className="text-lg font-semibold text-gray-700 mt-2 mb-2 block h-10"
              style={{
                maxWidth: "95%",
              }}
            >
              What type of house is your bathroom in?
            </Label>
            <div
              style={{
                marginTop: 24,
              }}
            >
              <div className="border border-gray-300 rounded-lg p-2">
                <Select
                  options={[
                    {
                      key: "Condo",
                      NAME: "Condo",
                      PRICE: 1000,
                      SKU: "CON",
                      IMAGE: "/quote/condo.svg",
                    },
                    {
                      key: "House",
                      NAME: "House",
                      PRICE: 0,
                      SKU: "HOU",
                      IMAGE: "/quote/house.svg",
                    },
                    {
                      key: "Townhouse",
                      NAME: "Townhouse",
                      PRICE: 500,
                      SKU: "TOW",
                      IMAGE: "/quote/townhouse.svg",
                    },
                  ]}
                  value={houseType}
                  onChange={(value: string) => setHouseType(value as HouseType)}
                  renderDefaultImage={true}
                  renderSKU={false}
                />
              </div>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <div
              className=" p-6 rounded-lg"
              style={{
                height: 243,
              }}
            >
              <p className="text-xl font-semibold text-gray-800 mt-2 mb-2 h-10 max-w-5/6">
                Estimated Quote Range:
              </p>
              <p className="text-3xl font-bold text-gray-900 bg-gray-100 rounded-lg px-4 py-8 mt-6 mb-4 text-center">
                ${lowerQuote.toLocaleString()} - ${upperQuote.toLocaleString()}
              </p>
              <div className="flex flex-col  mt-6">
                <Button
                  onClick={handleGetExactQuote}
                  onTouchEnd={handleGetExactQuote}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-6 rounded-lg text-lg transition duration-300"
                >
                  Get Exact Quote
                </Button>
                <p
                  className="text-gray-500 text-sm m-2 text-center underline"
                  style={{ cursor: "pointer" }}
                  onClick={onPreviousStep}
                >
                  Change Details
                </p>
              </div>
            </div>
          </>
        )}
        {step !== 6 && (
          <>
            <div
              className="flex justify-between  gap-4"
              style={{ marginTop: 16 }}
            >
              {step > 1 && (
                <Button
                  onClick={onPreviousStep}
                  onTouchEnd={onPreviousStep}
                  className=" text-gray-800 font-semibold py-2 px-4 rounded-lg w-full border border-gray-300"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={onNextStep}
                onTouchEnd={onNextStep}
                className="bg-black text-white font-semibold py-2 px-4 rounded-lg w-full"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
