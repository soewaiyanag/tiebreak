import { forwardRef, type ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonVariant } from "./button-classes";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonClasses(variant, className)} {...props} />;
});
