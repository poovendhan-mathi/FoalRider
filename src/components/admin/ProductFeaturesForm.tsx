"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface ProductFeaturesFormProps {
  productId: string;
}

interface ProductFeatures {
  fit: string;
  rise: string;
  leg_style: string;
  closure: string;
  stretch_level: string;
  material: string;
  care_instructions: string[];
  sustainability: string;
  country_of_origin: string;
  front_rise: string;
  knee_measurement: string;
  leg_opening: string;
  inseam: string;
  model_height: string;
  model_waist: string;
  model_size_worn: string;
  style_notes: string;
}

const defaultFeatures: ProductFeatures = {
  fit: "",
  rise: "",
  leg_style: "",
  closure: "",
  stretch_level: "",
  material: "",
  care_instructions: [],
  sustainability: "",
  country_of_origin: "",
  front_rise: "",
  knee_measurement: "",
  leg_opening: "",
  inseam: "",
  model_height: "",
  model_waist: "",
  model_size_worn: "",
  style_notes: "",
};

export default function ProductFeaturesForm({
  productId,
}: ProductFeaturesFormProps) {
  const [features, setFeatures] = useState<ProductFeatures>(defaultFeatures);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [careText, setCareText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function loadFeatures() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/products/${productId}/features`
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setFeatures(data);
            setCareText(data.care_instructions?.join("\n") || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatures();
  }, [productId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const careInstructions = careText
        .split("\n")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const response = await fetch(
        `/api/admin/products/${productId}/features`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...features,
            care_instructions: careInstructions,
          }),
        }
      );

      if (response.ok) {
        toast({ title: "Success", description: "Product features updated" });
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "Error",
        description: "Failed to update features",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fit Information</CardTitle>
          <CardDescription>How this product fits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fit</Label>
              <Select
                value={features.fit}
                onValueChange={(v) => setFeatures({ ...features, fit: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Slim Through The Thigh">
                    Slim Through The Thigh
                  </SelectItem>
                  <SelectItem value="Regular Through The Thigh">
                    Regular Through The Thigh
                  </SelectItem>
                  <SelectItem value="Relaxed Through The Thigh">
                    Relaxed Through The Thigh
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rise</Label>
              <Select
                value={features.rise}
                onValueChange={(v) => setFeatures({ ...features, rise: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low Rise">Low Rise</SelectItem>
                  <SelectItem value="Mid Rise">Mid Rise</SelectItem>
                  <SelectItem value="Sits At Your Waist">
                    Sits At Your Waist
                  </SelectItem>
                  <SelectItem value="High Rise">High Rise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leg Style</Label>
              <Select
                value={features.leg_style}
                onValueChange={(v) =>
                  setFeatures({ ...features, leg_style: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leg style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skinny Leg">Skinny Leg</SelectItem>
                  <SelectItem value="Slim Leg">Slim Leg</SelectItem>
                  <SelectItem value="Straight Leg">Straight Leg</SelectItem>
                  <SelectItem value="Wide Leg">Wide Leg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Material & Construction</CardTitle>
          <CardDescription>Fabric and construction details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Closure Type</Label>
              <Select
                value={features.closure}
                onValueChange={(v) => setFeatures({ ...features, closure: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select closure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Button Fly">Button Fly</SelectItem>
                  <SelectItem value="Zip Fly">Zip Fly</SelectItem>
                  <SelectItem value="Drawstring">Drawstring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stretch Level</Label>
              <Select
                value={features.stretch_level}
                onValueChange={(v) =>
                  setFeatures({ ...features, stretch_level: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stretch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non-Stretch">Non-Stretch</SelectItem>
                  <SelectItem value="Slight Stretch">Slight Stretch</SelectItem>
                  <SelectItem value="Stretch">Stretch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country of Origin</Label>
              <Input
                value={features.country_of_origin}
                onChange={(e) =>
                  setFeatures({
                    ...features,
                    country_of_origin: e.target.value,
                  })
                }
                placeholder="e.g., India"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Material Composition</Label>
            <Input
              value={features.material}
              onChange={(e) =>
                setFeatures({ ...features, material: e.target.value })
              }
              placeholder="e.g., 98% Cotton, 2% Elastane"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurements (Size 32)</CardTitle>
          <CardDescription>
            Standard measurements for size reference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Front Rise</Label>
              <Input
                value={features.front_rise}
                onChange={(e) =>
                  setFeatures({ ...features, front_rise: e.target.value })
                }
                placeholder='11"'
              />
            </div>
            <div className="space-y-2">
              <Label>Knee</Label>
              <Input
                value={features.knee_measurement}
                onChange={(e) =>
                  setFeatures({ ...features, knee_measurement: e.target.value })
                }
                placeholder='17"'
              />
            </div>
            <div className="space-y-2">
              <Label>Leg Opening</Label>
              <Input
                value={features.leg_opening}
                onChange={(e) =>
                  setFeatures({ ...features, leg_opening: e.target.value })
                }
                placeholder='16"'
              />
            </div>
            <div className="space-y-2">
              <Label>Inseam</Label>
              <Input
                value={features.inseam}
                onChange={(e) =>
                  setFeatures({ ...features, inseam: e.target.value })
                }
                placeholder='32"'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Model measurements for reference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Model Height</Label>
              <Input
                value={features.model_height}
                onChange={(e) =>
                  setFeatures({ ...features, model_height: e.target.value })
                }
                placeholder="6ft 1in"
              />
            </div>
            <div className="space-y-2">
              <Label>Model Waist</Label>
              <Input
                value={features.model_waist}
                onChange={(e) =>
                  setFeatures({ ...features, model_waist: e.target.value })
                }
                placeholder='32"'
              />
            </div>
            <div className="space-y-2">
              <Label>Size Worn</Label>
              <Input
                value={features.model_size_worn}
                onChange={(e) =>
                  setFeatures({ ...features, model_size_worn: e.target.value })
                }
                placeholder="32 x 32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Care & Sustainability</CardTitle>
          <CardDescription>
            Care instructions and sustainability info
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Care Instructions (one per line)</Label>
            <Textarea
              value={careText}
              onChange={(e) => setCareText(e.target.value)}
              placeholder={
                "Machine wash cold\nTumble dry medium\nDo not bleach"
              }
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Sustainability Information</Label>
            <Textarea
              value={features.sustainability}
              onChange={(e) =>
                setFeatures({ ...features, sustainability: e.target.value })
              }
              placeholder="Made with organic cotton..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Style Notes</Label>
            <Textarea
              value={features.style_notes}
              onChange={(e) =>
                setFeatures({ ...features, style_notes: e.target.value })
              }
              placeholder="The original blue jean since 1970..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Features
        </Button>
      </div>
    </div>
  );
}
