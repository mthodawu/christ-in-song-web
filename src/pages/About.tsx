import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon, Rocket, ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Navigation from '@/components/Navigation';

const About = () => {
  const navigate = useNavigate();
  const [isWatchDemoOpen, setIsWatchDemoOpen] = useState(false);

  return (
    <div className="min-h-screen pt-16">
      <div className="opacity-0 hover:opacity-100"><Navigation  /></div>
      <main className="container max-w-3xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2" />
          to the Hymns!
        </Button>

        <div className=" w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full text-center mb-4">
            <img className="w-24 h-24 p-4" src="/icon.png" alt="icon" />
            <span className="text-3xl">About this app</span>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-sm text-muted-foreground text-justify w-4/5 md:w-1/2 mb-1">
              This Christ in Song web app was developed by iLanga Creatives to
              help Music & Media teams easily navigate, display, and project hymns in multiple
              languages during worship services. <br/><br/> Keyboard shortcuts have been added for convenience. Just press <strong>i</strong> to view the full list.                                                                                                      
              <br /> <br />
              If you want to learn more about this app and how to use it, please
              watch the demo video below.
            </p>
            <>
              <Button
                variant="outline"
                className="md:w-1/5 flex items-center justify-center gap-2 text-primary "
                onClick={() => setIsWatchDemoOpen(true)}
              >
                Watch Demo <PlayCircleIcon className="w-4 h-4" />
              </Button>
              <Dialog open={isWatchDemoOpen} onOpenChange={setIsWatchDemoOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Watch Demo</DialogTitle>
                    <DialogDescription>
                      Learn how to use the Christ in Song app
                    </DialogDescription>
                  </DialogHeader>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/62MNc2xODog?si=adRVIwjLrl-dLo4K"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </>
            {/* <hr className="border-t border-gray-200 dark:border-gray-700 w-1/2  " /> */}
            <p className="text-sm text-muted-foreground">
              For any queries or feedback, please contact us:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>
                Email:{" "}
                <a
                  href="mailto:ilangacreatives@gmail.com"
                  className="text-primary hover:underline"
                >
                  ilangacreatives@gmail.com
                </a>
              </li>
              <li>
                Instagram:{" "}
                <a
                  href="https://instagram.com/ilangacreatives"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @ilangacreatives
                </a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="https://ilangacreatives.co.za"
                  className="text-primary hover:underline group inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ilangacreatives.co.za
                  <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            </ul>
            <hr className="border-t border-gray-200 dark:border-gray-700 w-1/2  my-2" />
            <div className="flex flex-col md:flex-row gap-4 -mt-4 justify-between items-center w-4/5 md:w-1/2">
              <p className="text-sm text-muted-foreground w-full text-center md:text-left mt-2 order-1">
                Download the mobile apps developed by Tinashe Mzondiwa:
              </p>
              <div className="flex gap-4 items-center justify-center md:justify-start w-full md:w-1/2 mt-2 ml order-2">
                <a
                  href="https://play.google.com/store/apps/details?id=com.tinashe.christInSong&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity ml-2 mr-4 flex flex-col items-center"
                >
                  <img
                    src="https://img.icons8.com/fluency/48/google-play-store-new.png"
                    alt="Get it on Google Play"
                    className="h-12 w-12 md:h-8 md:w-8"
                  />
                  <p className="text-sm md:text-xs text-muted-foreground text-center"><span className="block md:hidden">Download on</span>Android </p>
                </a>
                <a
                  href="https://apps.apple.com/us/app/christ-in-song-multi-language/id1067718185"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity flex flex-col items-center"
                >
                  <img
                    src="https://img.icons8.com/color/48/apple-app-store--v1.png"
                    alt="Download on the App Store"
                    className="h-12 w-12 md:h-8 md:w-8"
                  />
                  <p className="text-sm md:text-xs text-muted-foreground text-center"><span className="block md:hidden">Download on</span>iOS</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
