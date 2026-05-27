import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ColorPaletteProps {
  onApply?: () => void;
}

const defaultColors = {
  primary: "222.2 47.4% 11.2%",
  secondary: "210 40% 96.1%",
  accent: "210 40% 96.1%",
  muted: "210 40% 96.1%",
  background: "0 0% 100%",
};

const ColorPalette = ({ onApply }: ColorPaletteProps) => {
  const [colors, setColors] = useLocalStorage("salon-colors", defaultColors);

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors({ ...colors, [colorKey]: value });
  };

  const applyColors = () => {
    // Apply colors to CSS variables
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty("--secondary", colors.secondary);
    document.documentElement.style.setProperty("--accent", colors.accent);
    document.documentElement.style.setProperty("--muted", colors.muted);
    document.documentElement.style.setProperty(
      "--background",
      colors.background,
    );

    if (onApply) onApply();
  };

  const resetColors = () => {
    setColors(defaultColors);
    document.documentElement.style.setProperty(
      "--primary",
      defaultColors.primary,
    );
    document.documentElement.style.setProperty(
      "--secondary",
      defaultColors.secondary,
    );
    document.documentElement.style.setProperty(
      "--accent",
      defaultColors.accent,
    );
    document.documentElement.style.setProperty("--muted", defaultColors.muted);
    document.documentElement.style.setProperty(
      "--background",
      defaultColors.background,
    );
  };

  // Apply colors on component mount
  React.useEffect(() => {
    applyColors();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palette Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md bg-primary"
                style={{ backgroundColor: `hsl(${colors.primary})` }}
              />
              <Input
                id="primary-color"
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                placeholder="222.2 47.4% 11.2%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: `hsl(${colors.secondary})` }}
              />
              <Input
                id="secondary-color"
                value={colors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                placeholder="210 40% 96.1%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: `hsl(${colors.accent})` }}
              />
              <Input
                id="accent-color"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                placeholder="210 40% 96.1%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="muted-color">Muted Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: `hsl(${colors.muted})` }}
              />
              <Input
                id="muted-color"
                value={colors.muted}
                onChange={(e) => handleColorChange("muted", e.target.value)}
                placeholder="210 40% 96.1%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: `hsl(${colors.background})` }}
              />
              <Input
                id="background-color"
                value={colors.background}
                onChange={(e) =>
                  handleColorChange("background", e.target.value)
                }
                placeholder="0 0% 100%"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetColors}>
            Reset to Default
          </Button>
          <Button onClick={applyColors}>Apply Colors</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPalette;
