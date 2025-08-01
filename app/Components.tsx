import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import {
  RadioGroup,
  RadioGroupItem as RadioGroupItem,
} from "@radix-ui/react-radio-group"; // Adjust the import path accordingly
import Image from "next/image";

// Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Card Component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Label Component
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// New Select Component
const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  {
    options: {
      NAME: string;
      PRICE: number;
      SKU: string;
      IMAGE: string;
      key: string;
      SIZE?: string;
      COLOR?: string;
      renderDefaultImage?: boolean;
      renderSKU?: boolean;
    }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    renderDefaultImage?: boolean;
    renderSKU?: boolean;
  }
>(
  ({
    options,
    value,
    onChange,
    placeholder,
    renderDefaultImage = false,
    renderSKU = true,
  }) => {
    // Find the selected option based on the value
    const selectedOption = options.find((option) => option.key === value);

    return (
      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          className="SelectTrigger"
          style={{
            width: "100%",
            margin: "10px",
          }}
        >
          {renderDefaultImage && selectedOption && (
            <Image
              src={selectedOption.IMAGE || "/item-missing.svg"}
              alt={selectedOption.NAME}
              style={{ width: "auto", height: "36px", margin: "0 auto 10px" }} // Adjust size as needed
              width={100}
              height={36}
            />
          )}
          <SelectPrimitive.Value placeholder={placeholder} />
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="SelectContent">
            <SelectPrimitive.Viewport
              className="SelectViewport"
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                border: "1px solid lightgray",
              }}
            >
              {options.map((option, index) => (
                <SelectPrimitive.Item
                  key={option.key}
                  value={option.key}
                  className="SelectItem"
                  style={{
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderBottom:
                      index === options.length - 1
                        ? "none"
                        : "1px solid lightgray",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <SelectPrimitive.ItemIndicator
                        style={{ marginRight: "10px" }}
                      >
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                      <SelectPrimitive.ItemText>
                        <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                          {option.NAME.length > 20
                            ? `${option.NAME.slice(0, 20)}...`
                            : option.NAME}
                        </span>
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemText>
                        <span style={{ fontSize: "14px" }}>
                          {option?.SIZE && (
                            <span style={{ marginLeft: "10px" }}>
                              {option.SIZE}
                            </span>
                          )}
                        </span>
                      </SelectPrimitive.ItemText>
                    </div>
                    {/* {option.COLOR && (
                    <SelectPrimitive.ItemText>
                      <span style={{ marginLeft: "4px" }}>({option.COLOR})</span>
                    </SelectPrimitive.ItemText>
                  )} */}

                    {renderSKU && (
                      <SelectPrimitive.ItemText>
                        <span
                          style={{
                            marginLeft: "4px",
                            color: "gray",
                            fontSize: "14px",
                          }}
                        >
                          ({option.SKU})
                        </span>
                      </SelectPrimitive.ItemText>
                    )}
                  </div>
                  {option.IMAGE && (
                    <SelectPrimitive.Icon>
                      <Image
                        src={option.IMAGE || "/item-missing.svg"}
                        alt="Description of image"
                        style={{
                          width: "auto",
                          height: renderDefaultImage ? "48px" : "100px",
                        }}
                        width={100}
                        height={renderDefaultImage ? 48 : 100}
                      />
                    </SelectPrimitive.Icon>
                  )}
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);
Select.displayName = "Select";

// Checkbox Component
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Accordion Component
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// Separator Component
const Separator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
Separator.displayName = SelectPrimitive.Separator.displayName;

// New RadioGroup Component
// Removed the previous RadioGroup implementation
// Added new RadioGroup and RadioGroupItem components
// This implementation uses context for better state management
// and allows for more flexible usage of radio buttons.

export {
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Label,
  Input,
  Select,
  Checkbox,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Separator,
  RadioGroup,
  RadioGroupItem,
};
