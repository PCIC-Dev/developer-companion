import { Toaster as Sonner, toast } from "sonner";

function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={96}
      toastOptions={{
        className: "rounded-[12px] bg-solid px-5 py-3 font-bold text-solid-foreground",
      }}
    />
  );
}
export { Toaster, toast };
