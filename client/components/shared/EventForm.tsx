import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eventFormSchema } from "@/lib/validator";
import * as z from "zod";
import { eventDefaultValues } from "@/constants";
import Dropdown from "./Dropdown";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/redux/features/event/eventApi";
import { IEvent } from "@/types/index";

type EventFormProps = {
  userId: string;
  type: "Create" | "Update";
  event?: IEvent;
  eventId?: string;
};

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: eventDefaultValues,
  });

  // Use useEffect to update form values when event data is available
  useEffect(() => {
    if (event && type === "Update") {
      // Set the uploaded image if it exists
      if (event.image?.url) {
        setUploadedImage(event.image.url);
      }

      // Reset form with event data
      form.reset({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        image: event.image || undefined,
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime),
        categoryId: event.category._id || "",
        price: event.price || "",
        isFree: event.isFree || false,
        url: event.url || "",
      });
    }
  }, [event, type, form]);
  const router = useRouter();

  // const form = useForm<z.infer<typeof eventFormSchema>>({
  //   resolver: zodResolver(eventFormSchema),
  //   defaultValues: initialValues,
  // });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (type === "Create") {
      try {
        const newEvent = await createEvent({
          event: { ...values, image: uploadedImage },
          userId,
          path: "/profile",
        });

        if (newEvent.data?._id) {
          form.reset();
          router.push(`/events/${newEvent.data._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === "Update") {
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, image: uploadedImage, _id: eventId },
          path: `/events/${eventId}`,
        });

        if (updatedEvent.data?._id) {
          form.reset();
          router.push(`/events/${updatedEvent.data._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue("image", { url: result });
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Event title"
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Dropdown
                    onChangeHandler={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <Textarea
                    placeholder="Description"
                    {...field}
                    className="textarea rounded-2xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <div className="flex items-center justify-center">
                    {uploadedImage && (
                      <div className="relative h-48 w-48">
                        <Image
                          src={uploadedImage}
                          alt="Event Image"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {!uploadedImage && (
                      <label
                        htmlFor="imageUpload"
                        className="flex h-48 w-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                      >
                        <span>Upload Image</span>
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          {...field}
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/location-grey.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                    />

                    <Input
                      placeholder="Event location or Online"
                      {...field}
                      className="input-field"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      Start Date:
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      End Date:
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/naira.svg"
                      alt="naira"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      {...field}
                      className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <label
                                htmlFor="isFree"
                                className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Free Ticket
                              </label>
                              <Checkbox
                                onCheckedChange={field.onChange}
                                checked={field.value}
                                id="isFree"
                                className="mr-2 h-5 w-5 border-2 border-primary-500"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/assets/icons/link.svg"
                      alt="link"
                      width={24}
                      height={24}
                    />

                    <Input
                      placeholder="URL"
                      {...field}
                      className="input-field"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting || isCreating || isUpdating}
          className="button col-span-2 w-full"
        >
          {isCreating || isUpdating
            ? "Submitting..."
            : `${type === "Create" ? "Create" : "Update"} Event `}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
