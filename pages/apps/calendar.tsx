import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import IconPlus from "@/components/Icon/IconPlus";
import IconX from "@/components/Icon/IconX";

const Calendar = ({ events: externalEvents }: { events?: any[] }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Calendar"));
  });

  useEffect(() => {
    if (externalEvents && externalEvents.length > 0) {
      setEvents(externalEvents);
    }
  }, [externalEvents]);

  const [events, setEvents] = useState<any>(externalEvents ?? []);
  const [isAddEventModal, setIsAddEventModal] = useState(false);
  const [minStartDate, setMinStartDate] = useState<any>("");
  const [minEndDate, setMinEndDate] = useState<any>("");
  const defaultParams = {
    id: null,
    title: "",
    start: "",
    end: "",
    description: "",
    type: "primary",
  };
  const [params, setParams] = useState<any>(defaultParams);
  console.log("params", params);
  const dateFormat = (dt: any) => {
    dt = new Date(dt);
    const month =
      dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
    const date = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
    const hours = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
    const mins = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
    dt = dt.getFullYear() + "-" + month + "-" + date + "T" + hours + ":" + mins;
    return dt;
  };
  const editEvent = (data: any = null) => {
    console.log("data", data);
    let params = JSON.parse(JSON.stringify(defaultParams));
    setParams(params);
    if (data) {
      let obj = JSON.parse(JSON.stringify(data.event));
      console.log("obj", obj);
      setParams({
        id: obj.id ? obj.id : null,
        title: obj.title ? obj.title : null,
        start: dateFormat(obj.start),
        end: dateFormat(obj.end),
        type: obj.classNames ? obj.classNames[0] : "primary",
        description: obj.extendedProps ? obj.extendedProps.description : "",
        email: obj.extendedProps ? obj.extendedProps.email : "",
        phone: obj.extendedProps ? obj.extendedProps.phone : "",
        created_at: obj.extendedProps ? obj.extendedProps.created_at : "",
        property_name: obj.extendedProps
          ? obj.extendedProps.property_name
          : null,
      });
      setMinStartDate(new Date());
      setMinEndDate(dateFormat(obj.start));
    } else {
      setMinStartDate(new Date());
      setMinEndDate(new Date());
    }
    setIsAddEventModal(true);
  };
  const editDate = (data: any) => {
    let obj = {
      event: {
        start: data.start,
        end: data.end,
      },
    };
    editEvent(obj);
  };

  const saveEvent = () => {
    if (!params.title) {
      return true;
    }
    if (!params.start) {
      return true;
    }
    if (!params.end) {
      return true;
    }
    if (params.id) {
      //update event
      let dataevent = events || [];
      let event: any = dataevent.find((d: any) => d.id === parseInt(params.id));
      event.title = params.title;
      event.start = params.start;
      event.end = params.end;
      event.description = params.description;
      event.className = params.type;

      setEvents([]);
      setTimeout(() => {
        setEvents(dataevent);
      });
    } else {
      //add event
      let maxEventId = 0;
      if (events) {
        maxEventId = events.reduce(
          (max: number, character: any) =>
            character.id > max ? character.id : max,
          events[0].id,
        );
      }
      maxEventId = maxEventId + 1;
      let event = {
        id: maxEventId,
        title: params.title,
        start: params.start,
        end: params.end,
        description: params.description,
        className: params.type,
      };
      let dataevent = events || [];
      dataevent = dataevent.concat([event]);
      setTimeout(() => {
        setEvents(dataevent);
      });
    }
    showMessage("Event has been saved successfully.");
    setIsAddEventModal(false);
  };
  const startDateChange = (event: any) => {
    const dateStr = event.target.value;
    if (dateStr) {
      setMinEndDate(dateFormat(dateStr));
      setParams({ ...params, start: dateStr, end: "" });
    }
  };
  const changeValue = (e: any) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };
  const showMessage = (msg = "", type = "success") => {
    const toast: any = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: "toast" },
    });
    toast.fire({
      icon: type,
      title: msg,
      padding: "10px 20px",
    });
  };

  return (
    <div>
      <div className=" mb-5">
        <div className="mb-4 flex flex-col items-center justify-center sm:flex-row sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="text-center text-lg font-semibold ltr:sm:text-left rtl:sm:text-right">
              Calendar
            </div>

          </div>

        </div>
        <div className="calendar-wrapper" style={{ fontSize: "0.75rem" }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            editable={true}
            dayMaxEvents={2}
            selectable={true}
            droppable={true}
            eventClick={(event: any) => editEvent(event)}
            select={(event: any) => editDate(event)}
            events={events}
            contentHeight={610}
          />
        </div>
      </div>

      {/* add event modal */}
      <Transition appear show={isAddEventModal} as={Fragment}>
        <Dialog
          as="div"
          onClose={() => setIsAddEventModal(false)}
          open={isAddEventModal}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <button
                    type="button"
                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                    onClick={() => setIsAddEventModal(false)}
                  >
                    <IconX />
                  </button>
                  <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                    {params.id ? "Booking Details" : "Add Event"}
                  </div>
                  <div className="p-5">
                    <form className="space-y-5">
                      <div>
                        <label htmlFor="title">{"Inquiry Type"} :</label>
                        <input
                          id="title"
                          type="text"
                          name="title"
                          className="form-input"
                          placeholder="Enter Event Title"
                          value={params.property_name ? "Property" : "General"}
                          onChange={(e) => changeValue(e)}
                          required
                          disabled
                        />
                        <div className="mt-2 text-danger" id="titleErr"></div>
                      </div>
                      {params?.property_name && (
                        <div>
                          <label htmlFor="title">{"Property Name"} :</label>
                          <input
                            id="title"
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="Enter Event Title"
                            value={params.title || ""}
                            onChange={(e) => changeValue(e)}
                            required
                            disabled
                          />
                          <div className="mt-2 text-danger" id="titleErr"></div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="title">Email :</label>
                        <input
                          id="email"
                          type="text"
                          name="email"
                          className="form-input"
                          placeholder="Enter Event Title"
                          value={params.email || ""}
                          onChange={(e) => changeValue(e)}
                          disabled
                        />
                        <div className="mt-2 text-danger" id="titleErr"></div>
                      </div>
                      <div>
                        <label htmlFor="title">Phone :</label>
                        <input
                          id="phone"
                          type="text"
                          name="phone"
                          className="form-input"
                          placeholder="Enter Event Title"
                          value={params.phone || ""}
                          onChange={(e) => changeValue(e)}
                          disabled
                        />
                        <div className="mt-2 text-danger" id="titleErr"></div>
                      </div>

                      <div>
                        <label htmlFor="dateStart">Schedule Date :</label>
                        <input
                          id="start"
                          type="datetime-local"
                          name="start"
                          className="form-input"
                          placeholder="Event Start Date"
                          value={params.start || ""}
                          min={minStartDate}
                          onChange={(event: any) => startDateChange(event)}
                          required
                          disabled
                        />
                        <div
                          className="mt-2 text-danger"
                          id="startDateErr"
                        ></div>
                      </div>

                      <div>
                        <label htmlFor="description">Inquiry Details :</label>
                        <textarea
                          id="description"
                          name="description"
                          className="form-textarea min-h-[130px]"
                          placeholder="Enter Event Description"
                          value={params.description || ""}
                          onChange={(e) => changeValue(e)}
                          disabled
                        ></textarea>
                      </div>

                      {/* <div className="!mt-8 flex items-center justify-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => setIsAddEventModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEvent()}
                          className="btn btn-dred ltr:ml-4 rtl:mr-4"
                        >
                          {params.id ? "Update Event" : "Create Event"}
                        </button>
                      </div> */}
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Calendar;
