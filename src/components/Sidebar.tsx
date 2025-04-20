import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Info, Moon,  Menu, ArrowLeft, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


const navItems = [
  { icon: <ArrowLeft />, label: "to Hymns", to: "/" },
  { icon: <Moon />, label: "Dark Mode", action: "dark" },
  { icon: <Info />, label: "Help & Info", action: "info" },
  { icon: <MessageCircleQuestion />, label: "About this App", to: "/about" },
 
];

export default function MobileSidebar({
  onDualMode,
  onDarkMode,
  onInfo,
}: {
  onDualMode: () => void;
  onDarkMode: () => void;
  onInfo: () => void;
}) {
  const navigate = useNavigate();

  const handleNav = (item: any) => {
    if (item.to) navigate(item.to);
  
    if (item.action === "dark") onDarkMode();
    if (item.action === "info") onInfo();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden">
          <span className="sr-only">Open menu</span>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start"
              onClick={() => handleNav(item)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}