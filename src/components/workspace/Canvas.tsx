import { Upload, Image, FileText, BarChart3 } from "lucide-react";

interface CanvasProps {
  items: any[];
}

const Canvas = ({ items }: CanvasProps) => {
  return (
    <div className="flex-1 relative bg-background">
      {/* Canvas area */}
      <div className="absolute inset-0 p-8">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <h1 className="text-4xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                How to Use Kuse
              </h1>
              
              <div className="grid grid-cols-3 gap-6 mt-12">
                {/* Step 1 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Upload your files</p>
                    <p className="text-xs">Support jpeg, png, webp, doc, pdf, xls, csv, txt, Youtube link</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-secondary/30 rounded-xl flex flex-col items-center justify-center mb-4 gap-2">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 bg-background px-2 py-1 rounded">
                        <Image className="w-3 h-3" />
                        <span>Generate image</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 bg-background px-2 py-1 rounded">
                        <FileText className="w-3 h-3" />
                        <span>Create web page</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 bg-background px-2 py-1 rounded">
                        <BarChart3 className="w-3 h-3" />
                        <span>Make a chart</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Enter your prompt</p>
                    <p className="text-xs">Select content & ask anything</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                    <div className="relative w-full h-full p-4">
                      <div className="absolute top-4 right-4 w-16 h-20 bg-primary/80 rounded shadow-lg transform rotate-6"></div>
                      <div className="absolute top-6 left-6 w-16 h-20 bg-accent/60 rounded shadow-lg transform -rotate-3"></div>
                      <div className="absolute bottom-4 right-8 w-16 h-20 bg-yellow-500/60 rounded shadow-lg transform rotate-12"></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Get amazing results</p>
                    <p className="text-xs">Visualize and collaborate</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">1</div>
                  <span>Drop files onto the canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">2</div>
                  <span>Select content & ask anything</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">3</div>
                  <span>Get amazing results</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Canvas items will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
