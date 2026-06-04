import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Search,
  ListOrdered,
  MonitorPlay,
  Download,
  Loader2,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const DOWNLOAD_URL = "https://github.com/mthodawu/cis-desktop/releases/download/v1.0.0/Presentation.Studio-1.0.0.Setup.exe";
const VERSION = "v1.0.0-alpha.1";

const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "proton.me", "protonmail.com", "yahoo.co.uk",
  "googlemail.com", "live.com", "msn.com", "ymail.com",
];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) return true;
  if (domain.endsWith(".org") || domain.endsWith(".edu")) return true;
  if (/\.ac\.[a-z]{2,}$/.test(domain)) return true;
  return false;
}

const COUNTRY_CODES = [
  { code: "+61", country: "Australia" },
  { code: "+267", country: "Botswana" },
  { code: "+55", country: "Brazil" },
  { code: "+257", country: "Burundi" },
  { code: "+237", country: "Cameroon" },
  { code: "+243", country: "DR Congo" },
  { code: "+268", country: "Eswatini" },
  { code: "+251", country: "Ethiopia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+233", country: "Ghana" },
  { code: "+91", country: "India" },
  { code: "+254", country: "Kenya" },
  { code: "+266", country: "Lesotho" },
  { code: "+265", country: "Malawi" },
  { code: "+258", country: "Mozambique" },
  { code: "+264", country: "Namibia" },
  { code: "+64", country: "New Zealand" },
  { code: "+234", country: "Nigeria" },
  { code: "+250", country: "Rwanda" },
  { code: "+27", country: "South Africa" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
  { code: "+44", country: "United Kingdom" },
  { code: "+1", country: "USA / Canada" },
  { code: "+260", country: "Zambia" },
  { code: "+263", country: "Zimbabwe" },
];

type ContactType = "email" | "phone";

interface FormState {
  name: string;
  church: string;
  contactType: ContactType;
  contactValue: string;
  countryCode: string;
}

const PresentationStudio = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    church: "",
    contactType: "email",
    contactValue: "",
    countryCode: "+27",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "submit", string>>>({});
  const [countryOpen, setCountryOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState | "submit", string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.church.trim()) newErrors.church = "Church / organisation is required";
    if (!form.contactValue.trim()) {
      newErrors.contactValue = "Contact is required";
    } else if (form.contactType === "email" && !isValidEmail(form.contactValue)) {
      newErrors.contactValue = "Use a popular email domain (e.g. gmail, outlook) or a .org / .edu address";
    } else if (
      form.contactType === "phone" &&
      !/^\d{7,15}$/.test(form.contactValue.replace(/[\s\-()]/g, ""))
    ) {
      newErrors.contactValue = "Please enter a valid phone number (digits only)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const contact =
      form.contactType === "phone"
        ? `${form.countryCode}${form.contactValue.replace(/[\s\-()]/g, "")}`
        : form.contactValue.trim();
    try {
      await fetch(`${API_BASE_URL}/downloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          church: form.church.trim(),
          contactType: form.contactType,
          contact,
          version: VERSION,
        }),
      });
    } catch (_) {
      // Submission is best-effort — proceed to download regardless
    } finally {
      setSubmitting(false);
      setIsDialogOpen(false);
      window.open(DOWNLOAD_URL, "_blank", "noopener,noreferrer");
    }
  };

  const features = [
    {
      id: "hymnals",
      title: "Hymnals",
      icon: <BookOpen className="w-5 h-5 mr-2" />,
      description: "Browse and search hymns across 11 built-in hymnals including English, Ndebele, Shona, Sotho, Swahili, Tonga, Tswana, Venda, Xhosa, Xitsonga, and SDAH.",
      screenshot: "/screenshots/hymns_ui.webp",
      bullets: [
        "Full-text search across all hymnals simultaneously",
        "Display two hymnal languages at once for bilingual audiences"
      ]
    },
    {
      id: "scripture",
      title: "Scripture",
      icon: <Search className="w-5 h-5 mr-2" />,
      description: "Access the Word quickly during any service without leaving the platform.",
      screenshot: "/screenshots/scripute_ui.webp",
      bullets: [
        "Built-in New King James Version (NKJV) Bible",
        "Search by reference or keyword instantly"
      ]
    },
    {
      id: "service-orders",
      title: "Service Orders",
      icon: <ListOrdered className="w-5 h-5 mr-2" />,
      description: "Prepare your worship service perfectly in advance.",
      screenshot: "/screenshots/services_ui.webp",
      bullets: [
        "Build and arrange a service sequence from hymns and scripture passages",
        "Reorder items via intuitive drag-and-drop",
        "Save and reload sequences for recurring services"
      ]
    },
    {
      id: "live-presentation",
      title: "Live Presentation",
      icon: <MonitorPlay className="w-5 h-5 mr-2" />,
      description: "Project with excellence and zero distractions.",
      screenshot: "/screenshots/notices_ui.webp",
      bullets: [
        "Dedicated presentation window optimized for a second display",
        "Display hymn verses and Bible passages with cinematic, full-screen typography",
        "Multiple font and background options to suit your church's aesthetic",
        "Upload slides, images and display announcements with ease"
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
        <Navigation />
      </div>
      <main className="container max-w-5xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2" />
          Back to Home
        </Button>

        <div className="w-full flex flex-col items-center justify-center -mt-4 mb-8">
          <div className="flex flex-col items-center justify-center w-full text-center mb-8">
            <div className="p-1 bg-primary/10 rounded-full mb-4">
              {/* <MonitorPlay className="w-12 h-12 text-primary" /> */}
               <img className="w-24 h-24 " src="/icon.png" alt="icon" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Presentation Studio</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl text-center">
              The ultimate all-in-one church presentation solution. <br/><br/>Download once. Use offline. <br/><em>Free forever</em>.
            </p>
            <Button
              size="lg"
              className="gap-2 text-base px-4 h-12 rounded-full mt-6"
              onClick={() => setIsDialogOpen(true)}
            >
              <Download className="w-5 h-5" />
              Windows Download
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                  <DialogTitle>Download Presentation Studio</DialogTitle>
                  <DialogDescription>
                    Help us know who's downloading so we can better support your church.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dl-name">Name</Label>
                    <Input
                      id="dl-name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dl-church">Church / Organisation</Label>
                    <Input
                      id="dl-church"
                      placeholder="Your church or organisation"
                      value={form.church}
                      onChange={(e) => setForm({ ...form, church: e.target.value })}
                    />
                    {errors.church && <p className="text-xs text-destructive">{errors.church}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Contact</Label>
                    <div className="flex rounded-lg border overflow-hidden">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          form.contactType === "email"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => setForm({ ...form, contactType: "email", contactValue: "" })}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          form.contactType === "phone"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => setForm({ ...form, contactType: "phone", contactValue: "" })}
                      >
                        Phone
                      </button>
                    </div>

                    {form.contactType === "email" ? (
                      <Input
                        type="email"
                        placeholder="you@gmail.com"
                        value={form.contactValue}
                        onChange={(e) => setForm({ ...form, contactValue: e.target.value })}
                      />
                    ) : (
                      <div className="flex gap-2">
                        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={countryOpen}
                              className="w-[150px] justify-between font-normal"
                            >
                              {form.countryCode}
                              <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search country..." />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {COUNTRY_CODES.map((c) => (
                                    <CommandItem
                                      key={c.code}
                                      value={`${c.code} ${c.country}`}
                                      onSelect={() => {
                                        setForm({ ...form, countryCode: c.code });
                                        setCountryOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          form.countryCode === c.code ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {c.code} {c.country}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={form.contactValue}
                          onChange={(e) => setForm({ ...form, contactValue: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    )}
                    {errors.contactValue && (
                      <p className="text-xs text-destructive">{errors.contactValue}</p>
                    )}
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 mt-2 rounded-full">
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download</>
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="hymnals" className="w-full mt-4">
            <div className="flex justify-center w-full">
              <TabsList className="flex w-full sm:w-auto sm:inline-flex h-12 items-center justify-center rounded-full bg-muted p-1 gap-0.5">
                {features.map((feature) => (
                  <TabsTrigger 
                    key={feature.id} 
                    value={feature.id} 
                    className="flex-1 sm:flex-none rounded-full sm:min-w-[120px] h-10 px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="flex items-center justify-center gap-1">
                      {feature.icon}
                      <span className="hidden sm:inline font-medium text-sm">{feature.title}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="mt-6 focus-visible:outline-none">
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-4 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 items-center">
                    <div className="flex-1 space-y-3 w-full order-2 md:order-1">
                      <h2 className="text-xl md:text-3xl font-semibold">
                        {feature.title}
                      </h2>
                      <p className="text-muted-foreground text-base md:text-lg">
                        {feature.description}
                      </p>
                      <ul className="space-y-2.5 mt-4">
                        {feature.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                            <span className="text-muted-foreground text-sm md:text-base leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex-1 w-full order-1 md:order-2">
                      <Card className="overflow-hidden shadow-lg border border-border/50 rounded-xl">
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={feature.screenshot}
                            alt={`${feature.title} screenshot`}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                            decoding="async"
                          />
                        </AspectRatio>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PresentationStudio;
