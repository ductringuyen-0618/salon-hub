import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Trash2, Clock } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: string;
}

const defaultServices: Service[] = [
  { id: "1", name: "Manicure", duration: 30, price: "$25" },
  { id: "2", name: "Pedicure", duration: 45, price: "$35" },
  { id: "3", name: "Full Set", duration: 60, price: "$45" },
  { id: "4", name: "Manicure & Pedicure", duration: 75, price: "$55" },
];

const ServiceManager = () => {
  const [services, setServices] = useLocalStorage<Service[]>(
    "salon-services",
    defaultServices,
  );
  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    duration: 30,
    price: "",
  });

  const handleAddService = () => {
    if (newService.name && newService.price) {
      const service: Service = {
        id: Date.now().toString(),
        ...newService,
      };

      setServices([...services, service]);
      setNewService({ name: "", duration: 30, price: "" });
    }
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="e.g. Gel Polish"
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="service-duration">Duration (min)</Label>
              <Input
                id="service-duration"
                name="duration"
                type="number"
                value={newService.duration}
                onChange={handleInputChange}
                min={1}
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor="service-price">Price</Label>
              <Input
                id="service-price"
                name="price"
                value={newService.price}
                onChange={handleInputChange}
                placeholder="e.g. $30"
              />
            </div>
            <div className="col-span-1">
              <Button onClick={handleAddService} className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b last:border-0">
                    <td className="p-2">{service.name}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {service.duration} min
                      </div>
                    </td>
                    <td className="p-2">{service.price}</td>
                    <td className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveService(service.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceManager;
