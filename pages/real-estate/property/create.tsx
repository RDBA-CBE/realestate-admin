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
    <div className="grid   gap-2.5 xl:grid-cols-10">
      <div className="relative mt-6 flex w-full flex-col items-center xl:col-span-1 xl:mt-2">
        {/* Stepper container */}
        <div className="flex flex-col items-center">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center">
            <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              1
            </div>
            <p className="mt-2 text-center font-semibold text-gray-800">
              Step 1
            </p>
            <p className="text-center text-sm text-gray-500">
              Description for step 1
            </p>
          </div>

          {/* Line connecting Step 1 → Step 2 */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Step 2 */}
          <div className="relative mt-2 flex flex-col items-center">
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

          {/* Line connecting Step 2 → Step 3 */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Step 3 */}
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
          </div>
        </div>
      </div>
      <div className="panel px-0 py-6 xl:col-span-9 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="flex flex-wrap justify-between px-4">
          <div className="mb-6 w-full lg:w-1/2">
            <div className="flex shrink-0 items-center text-black dark:text-white">
              <img src="/assets/images/logo.svg" alt="img" className="w-14" />
            </div>
            <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
              <div>13 Tetrick Road, Cypress Gardens, Florida, 33884, US</div>
              <div>vristo@gmail.com</div>
              <div>+1 (070) 123-4567</div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 lg:max-w-fit">
            <div className="flex items-center">
              <label htmlFor="number" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                Invoice Number
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
                Invoice Label
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
                Invoice Date
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
                Due Date
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
        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
        <div className="mt-8 px-4">
          <div className="flex flex-col justify-between lg:flex-row">
            <div className="mb-6 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
              <div className="text-lg">Bill To :-</div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-name"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Name
                </label>
                <input
                  id="reciever-name"
                  type="text"
                  name="reciever-name"
                  className="form-input flex-1"
                  placeholder="Enter Name"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-email"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Email
                </label>
                <input
                  id="reciever-email"
                  type="email"
                  name="reciever-email"
                  className="form-input flex-1"
                  placeholder="Enter Email"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-address"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Address
                </label>
                <input
                  id="reciever-address"
                  type="text"
                  name="reciever-address"
                  className="form-input flex-1"
                  placeholder="Enter Address"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-number"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Phone Number
                </label>
                <input
                  id="reciever-number"
                  type="text"
                  name="reciever-number"
                  className="form-input flex-1"
                  placeholder="Enter Phone number"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-lg">Payment Details:</div>
              <div className="mt-4 flex items-center">
                <label htmlFor="acno" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                  Account Number
                </label>
                <input
                  id="acno"
                  type="text"
                  name="acno"
                  className="form-input flex-1"
                  placeholder="Enter Account Number"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="bank-name"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Bank Name
                </label>
                <input
                  id="bank-name"
                  type="text"
                  name="bank-name"
                  className="form-input flex-1"
                  placeholder="Enter Bank Name"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="swift-code"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  SWIFT Number
                </label>
                <input
                  id="swift-code"
                  type="text"
                  name="swift-code"
                  className="form-input flex-1"
                  placeholder="Enter SWIFT Number"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label
                  htmlFor="iban-code"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  IBAN Number
                </label>
                <input
                  id="iban-code"
                  type="text"
                  name="iban-code"
                  className="form-input flex-1"
                  placeholder="Enter IBAN Number"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="w-1">Quantity</th>
                  <th className="w-1">Price</th>
                  <th>Total</th>
                  <th className="w-1"></th>
                </tr>
              </thead>
              <tbody>
                {items.length <= 0 && (
                  <tr>
                    <td colSpan={5} className="!text-center font-semibold">
                      No Item Available
                    </td>
                  </tr>
                )}
                {items.map((item: any) => {
                  return (
                    <tr className="align-top" key={item.id}>
                      <td>
                        <input
                          type="text"
                          className="form-input min-w-[200px]"
                          placeholder="Enter Item Name"
                          defaultValue={item.title}
                        />
                        <textarea
                          className="form-textarea mt-4"
                          placeholder="Enter Description"
                          defaultValue={item.description}
                        ></textarea>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input w-32"
                          placeholder="Quantity"
                          defaultValue={item.quantity}
                          min={0}
                          onChange={(e) =>
                            changeQuantityPrice(
                              "quantity",
                              e.target.value,
                              item.id
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input w-32"
                          placeholder="Price"
                          defaultValue={item.amount}
                          min={0}
                          onChange={(e) =>
                            changeQuantityPrice(
                              "price",
                              e.target.value,
                              item.id
                            )
                          }
                        />
                      </td>
                      <td>${item.quantity * item.amount}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(item)}>
                          <IconX className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
            <div className="mb-6 sm:mb-0">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addItem()}
              >
                Add Item
              </button>
            </div>
            <div className="sm:w-2/5">
              <div className="flex items-center justify-between">
                <div>Subtotal</div>
                <div>$0.00</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>Tax(%)</div>
                <div>0%</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>Shipping Rate($)</div>
                <div>$0.00</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>Discount(%)</div>
                <div>0%</div>
              </div>
              <div className="mt-4 flex items-center justify-between font-semibold">
                <div>Total</div>
                <div>$0.00</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 px-4">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-textarea min-h-[130px]"
            placeholder="Notes...."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Add;
