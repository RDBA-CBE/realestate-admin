import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../store/themeConfigSlice";
import IconX from "@/components/Icon/IconX";
import IconSave from "@/components/Icon/IconSave";
import IconSend from "@/components/Icon/IconSend";
import IconEye from "@/components/Icon/IconEye";
import IconDownload from "@/components/Icon/IconDownload";

const Add = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Invoice Add"));
  });
  const currencyList = [
    "USD - US Dollar",
    "GBP - British Pound",
    "IDR - Indonesian Rupiah",
    "INR - Indian Rupee",
    "BRL - Brazilian Real",
    "EUR - Germany (Euro)",
    "TRY - Turkish Lira",
  ];

  const [items, setItems] = useState<any>([
    {
      id: 1,
      title: "",
      description: "",
      rate: 0,
      quantity: 0,
      amount: 0,
    },
  ]);

  const addItem = () => {
    let maxId = 0;
    maxId = items?.length
      ? items.reduce(
          (max: number, character: any) =>
            character.id > max ? character.id : max,
          items[0].id
        )
      : 0;

    setItems([
      ...items,
      {
        id: maxId + 1,
        title: "",
        description: "",
        rate: 0,
        quantity: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (item: any = null) => {
    setItems(items.filter((d: any) => d.id !== item.id));
  };

  const changeQuantityPrice = (type: string, value: string, id: number) => {
    const list = items;
    const item = list.find((d: any) => d.id === id);
    if (type === "quantity") {
      item.quantity = Number(value);
    }
    if (type === "price") {
      item.amount = Number(value);
    }
    setItems([...list]);
  };

  return (
    <>
      <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
        <h5 className="text-lg font-semibold dark:text-white-light">
          Add New Property
        </h5>
      </div>

      <div className="grid   gap-2.5 xl:grid-cols-10">
        <div className="relative mt-6 flex w-full flex-col items-center xl:col-span-1 xl:mt-2">
          <div className="flex">
            <div className="mt-2 flex flex-col items-center xl:mt-0">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                1
              </div>
              <p className="mt-2 text-center font-semibold text-gray-800">
               Basic Details
              </p>

            </div>

            {/* <div className="relative mt-2 flex flex-col items-center">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-700">
                2
              </div>
              <p className="mt-2 text-center font-semibold text-gray-800">
                Step 2
              </p>
              <p className="text-center text-sm text-gray-500">
                Description for step 2
              </p>
            </div>

            <div className="h-px w-[50px] bg-gray-300 xl:h-[50px] xl:w-px"></div>

            <div className="relative mt-2 flex flex-col items-center">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-700">
                3
              </div>
              <p className="mt-2 text-center font-semibold text-gray-800">
                Step 3
              </p>
              <p className="text-center text-sm text-gray-500">
                Description for step 3
              </p>
            </div> */}
          </div>
        </div>
        <div className=" px-0 py-0 xl:col-span-9">
          <div className="panel  flex flex-col gap-5 md:flex-row md:items-center">
            <h5 className="text-lg font-semibold dark:text-white-light">
              Basic Details
            </h5>
          </div>
          <div className="panel flex flex-wrap justify-between px-4 mt-3">
            
            <div className="w-full lg:w-1/2 lg:max-w-fit">
              <div className="flex items-center">
                <label
                  htmlFor="number"
                  className="mb-0 flex-1 ltr:mr-2 rtl:ml-2"
                >
                  Property Title
                </label>
                <input
                  id="number"
                  type="text"
                  name="inv-num"
                  className="form-input w-2/3 lg:w-[250px]"
                  placeholder="#8801"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="invoiceLabel"
                  className="mb-0 flex-1 ltr:mr-2 rtl:ml-2"
                >
                Description
                </label>
                <input
                  id="invoiceLabel"
                  type="text"
                  name="inv-label"
                  className="form-input w-2/3 lg:w-[250px]"
                  placeholder="Enter Invoice Label"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="startDate"
                  className="mb-0 flex-1 ltr:mr-2 rtl:ml-2"
                >
                  Property Type
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="inv-date"
                  className="form-input w-2/3 lg:w-[250px]"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="dueDate"
                  className="mb-0 flex-1 ltr:mr-2 rtl:ml-2"
                >
                 Listing Type
                </label>
                <input
                  id="dueDate"
                  type="date"
                  name="due-date"
                  className="form-input w-2/3 lg:w-[250px]"
                />
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </>
  );
};

export default Add;
