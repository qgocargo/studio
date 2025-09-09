"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assignDelivery } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const assignDeliverySchema = z.object({
  jobFileId: z.string().min(1, "Job File is required."),
  origin: z.string().optional(),
  destination: z.string().optional(),
  airlines: z.string().optional(),
  mawb: z.string().optional(),
  inv: z.string().optional(),
  deliveryLocation: z.string().min(1, "Delivery Location is required."),
  additionalNotes: z.string().optional(),
  driverUid: z.string().min(1, "Driver is required."),
});

type AssignDeliveryFormValues = z.infer<typeof assignDeliverySchema>;

export function AssignDelivery({ jobFiles, drivers }: { jobFiles: any[], drivers: any[] }) {
  const [selectedJobFile, setSelectedJobFile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<AssignDeliveryFormValues>({
    resolver: zodResolver(assignDeliverySchema),
  });

  const handleJobSelect = (job: any) => {
    setSelectedJobFile(job);
    setValue("jobFileId", job.id);
    setValue("origin", job.or || '');
    setValue("destination", job.de || '');
    setValue("airlines", job.ca || '');
    setValue("mawb", job.mawb || '');
    setValue("inv", job.in || '');
  };
  
  const onSubmit = async (data: AssignDeliveryFormValues) => {
    if (!selectedJobFile) {
        toast({ variant: "destructive", title: "Error", description: "Please select a job file." });
        return;
    }
    
    setIsSubmitting(true);
    
    const driver = drivers.find(d => d.id === data.driverUid);
    const deliveryData = {
        jobFileId: data.jobFileId,
        jobFileData: {
            jfn: selectedJobFile.jfn || 'N/A',
            sh: selectedJobFile.sh || 'N/A',
            co: selectedJobFile.co || 'N/A',
            dsc: selectedJobFile.dsc || 'N/A',
            gw: selectedJobFile.gw || 'N/A',
            mawb: data.mawb || 'N/A',
            or: data.origin || 'N/A',
            de: data.destination || 'N/A',
            ca: data.airlines || 'N/A',
            in: data.inv || 'N/A',
        },
        deliveryLocation: data.deliveryLocation,
        deliveryNotes: data.additionalNotes,
        driverUid: data.driverUid,
        driverName: driver.displayName,
    };
    
    const result = await assignDelivery(deliveryData);

    if (result.success) {
        toast({ title: "Success", description: result.message });
        reset();
        setSelectedJobFile(null);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6" />
          <span>Assign New Delivery</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label>Search Job File</Label>
               <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="outline" role="combobox" className="w-full justify-between">
                            {selectedJobFile ? `${selectedJobFile.jfn} - ${selectedJobFile.sh}` : "Job No, Shipper, or Consignee..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search job files..." />
                             <CommandList>
                                <CommandEmpty>No job file found.</CommandEmpty>
                                <CommandGroup>
                                    {jobFiles.map((job) => (
                                        <CommandItem
                                            key={job.id}
                                            value={`${job.jfn} ${job.sh} ${job.co}`}
                                            onSelect={() => handleJobSelect(job)}
                                        >
                                            {job.jfn} - {job.sh}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
              {errors.jobFileId && <p className="text-sm font-medium text-destructive">{errors.jobFileId.message}</p>}
            </div>
            <div>
              <Label>Job Details</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm border min-h-[70px]">
                {selectedJobFile ? (
                    <>
                        <p><strong>Job No:</strong> {selectedJobFile.jfn}</p>
                        <p><strong>Details:</strong> {selectedJobFile.sh} / {selectedJobFile.co}</p>
                    </>
                ) : (
                    <p className="text-muted-foreground">Select a job</p>
                )}
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="delivery-origin">Country of Origin</Label>
                    <Input id="delivery-origin" {...register("origin")} placeholder="Auto-filled from Job" />
                </div>
                <div>
                    <Label htmlFor="delivery-destination">Destination</Label>
                    <Input id="delivery-destination" {...register("destination")} placeholder="Auto-filled from Job" />
                </div>
                <div>
                    <Label htmlFor="delivery-airlines">Airlines</Label>
                    <Input id="delivery-airlines" {...register("airlines")} placeholder="Auto-filled from Job" />
                </div>
                <div>
                    <Label htmlFor="delivery-mawb">AWB / MAWB</Label>
                    <Input id="delivery-mawb" {...register("mawb")} placeholder="Auto-filled from Job" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="delivery-inv">Invoice No.</Label>
                    <Input id="delivery-inv" {...register("inv")} placeholder="Auto-filled from Job" />
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="delivery-location">Delivery Location</Label>
              <Textarea id="delivery-location" {...register("deliveryLocation")} placeholder="Enter the full delivery address" />
              {errors.deliveryLocation && <p className="text-sm font-medium text-destructive">{errors.deliveryLocation.message}</p>}
            </div>
            <div>
              <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
              <Textarea id="additional-notes" {...register("additionalNotes")} placeholder="e.g., Contact person, delivery instructions" />
            </div>
            <div>
              <Label>Assign Driver</Label>
              <Controller
                control={control}
                name="driverUid"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select a Driver --" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>{driver.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.driverUid && <p className="text-sm font-medium text-destructive">{errors.driverUid.message}</p>}
            </div>
            <div className="text-right">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Delivery
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
