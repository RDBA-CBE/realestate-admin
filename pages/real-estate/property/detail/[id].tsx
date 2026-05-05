"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  capitalizeFLetter,
  commonDateFormat,
  formatPriceRange,
  formatToINRS,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import PrivateRouter from "@/hook/privateRouter";
import { RotatingLines } from "react-loader-spinner";
import {
  MapPin,
  Calendar,
  Building2,
  BedDouble,
  Bath,
  Layers,
  Home,
  Tag,
  CheckCircle,
  ArrowLeft,
  Maximize2,
  Wind,
  Car,
  IndianRupee,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PropertyDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useSetState({
    property: null,
    loading: true,
    lightboxIndex: null,
  });

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.property.details(id);
      setState({ property: res, loading: false });
    } catch (error) {
      console.log("error", error);
      setState({ loading: false });
    }
  };

  const p = state.property;

  if (state.loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RotatingLines visible strokeColor="gray" strokeWidth="5" animationDuration="0.75" width="40" ariaLabel="loading" />
      </div>
    );
  }

  if (!p) return null;

  const statusColor = p.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  const publishColor = p.publish ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";
  const approvedColor = p.is_approved ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

  const overviewItems = [
    { icon: <BedDouble className="h-4 w-4" />, label: "Bedrooms", value: p.bedrooms ?? "-" },
    { icon: <Bath className="h-4 w-4" />, label: "Bathrooms", value: p.bathrooms ?? "-" },
    { icon: <Home className="h-4 w-4" />, label: "Balconies", value: p.balconies ?? "-" },
    { icon: <Maximize2 className="h-4 w-4" />, label: "Total Area", value: p.total_area ? `${p.total_area} sq.ft` : "-" },
    { icon: <Maximize2 className="h-4 w-4" />, label: "Built-up Area", value: p.built_up_area ? `${p.built_up_area} sq.ft` : "-" },
    { icon: <Layers className="h-4 w-4" />, label: "Floor No.", value: p.floor_number ?? "-" },
    { icon: <Layers className="h-4 w-4" />, label: "Total Floors", value: p.total_floors ?? "-" },
    { icon: <Wind className="h-4 w-4" />, label: "Furnishing", value: capitalizeFLetter(p.furnishing ?? "-") },
    { icon: <Car className="h-4 w-4" />, label: "Parking", value: capitalizeFLetter(p.parking ?? "-") },
    { icon: <IndianRupee className="h-4 w-4" />, label: "Price/sq.ft", value: p.price_per_sqft ? `₹${p.price_per_sqft}` : "-" },
    { icon: <Calendar className="h-4 w-4" />, label: "Built Year", value: p.built_year ?? "-" },
    { icon: <Tag className="h-4 w-4" />, label: "Property Type", value: p.property_type?.map((t) => t.name).join(", ") || "-" },
  ];

  const metaItems = [
    { label: "Created By", value: p.created_by },
    { label: "Updated By", value: p.updated_by },
    { label: "Created At", value: commonDateFormat(p.created_at) },
    { label: "Updated At", value: commonDateFormat(p.updated_at) },
    // { label: "Views", value: p.views_count ?? 0 },
    { label: "Total Images", value: p.total_images ?? 0 },
    // { label: "Featured", value: p.is_featured ? "Yes" : "No" },
    // { label: "Verified", value: p.is_verified ? "Yes" : "No" },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h5 className="text-xl font-bold dark:text-white-light">{capitalizeFLetter(p.title)}</h5>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusColor}`}>{capitalizeFLetter(p.status)}</span>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${publishColor}`}>{p.publish ? "Published" : "Draft"}</span>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${approvedColor}`}>{p.is_approved ? "Approved" : "Pending Approval"}</span>
          <span className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-700">{capitalizeFLetter(p.listing_type)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left / Main Column */}
        <div className="space-y-5 xl:col-span-2">

          {/* Images Gallery */}
          <div className="panel overflow-hidden rounded-2xl p-3">
            {p.images?.length > 0 ? (
              <div className="flex h-[480px] gap-3">
                {/* Primary large image */}
                <div
                  className="relative flex-1 cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => setState({ lightboxIndex: 0 })}
                >
                  <img
                    src={p.images[0]?.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                {/* Right 2 thumbnails */}
                {p.images.length > 1 && (
                  <div className="flex w-[280px] shrink-0 flex-col gap-3">
                    {p.images.slice(1, 3).map((img, i) => (
                      <div
                        key={i}
                        className="relative flex-1 cursor-pointer overflow-hidden rounded-2xl"
                        onClick={() => setState({ lightboxIndex: i + 1 })}
                      >
                        <img
                          src={img.image_url}
                          alt={`image-${i + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {i === 1 && p.images.length > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-xl font-bold text-white">
                            + {p.images.length - 3} more
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-100 text-base text-gray-400 dark:bg-gray-800 rounded-2xl">
                No Images Available
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="panel rounded-xl">
            <h6 className="mb-4 text-base font-bold text-gray-800 dark:text-white">Overview</h6>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {overviewItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <span className="mt-0.5 shrink-0 text-[#9b0f09]">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <div className="panel rounded-xl">
              <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Description</h6>
              <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">{p.description}</p>
            </div>
          )}

          {/* Location */}
          <div className="panel rounded-xl">
            <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Location</h6>
            <div className="mb-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9b0f09]" />
              <span>
                {[p.address, p.city, p.state, p.country, p.postal_code]
                  .filter(Boolean)
                  .map(capitalizeFLetter)
                  .join(", ")}
              </span>
            </div>
            {p.latitude && p.longitude && (
              <iframe
                className="h-52 w-full rounded-lg"
                src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            )}
          </div>

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <div className="panel rounded-xl">
              <h6 className="mb-4 text-base font-bold text-gray-800 dark:text-white">Amenities</h6>
              <div className="flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1.5 rounded-full bg-[#9b0f09]/10 px-4 py-1.5 text-sm font-medium text-[#9b0f09]"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Price */}
          <div className="panel rounded-xl">
            <h6 className="mb-2 text-base font-bold text-gray-800 dark:text-white">Price</h6>
            <p className="text-3xl font-bold text-[#9b0f09]">
              {formatPriceRange(p.price_range?.minimum_price, p.price_range?.maximum_price)}
            </p>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>Min: {p.minimum_price ? formatToINRS(p.minimum_price) : "-"}</span>
              <span>Max: {p.maximum_price ? formatToINRS(p.maximum_price) : "-"}</span>
            </div>
          </div>

          {/* Developer */}
          {p.developer && (
            <div className="panel rounded-xl">
              <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Developer</h6>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9b0f09]/10 text-base font-bold text-[#9b0f09]">
                  {p.developer.first_name?.[0]}{p.developer.last_name?.[0]}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    {p.developer.first_name} {p.developer.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{p.developer.email}</p>
                  {p.developer.industry && (
                    <p className="text-sm text-gray-400">{p.developer.industry}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Agent */}
          {p.agent && (
            <div className="panel rounded-xl">
              <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Agent</h6>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-600">
                  {p.agent.first_name?.[0]}{p.agent.last_name?.[0]}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    {p.agent.first_name} {p.agent.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{p.agent.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project */}
          {p.project && (
            <div className="panel rounded-xl">
              <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Project</h6>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9b0f09]/10">
                  <Building2 className="h-6 w-6 text-[#9b0f09]" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-white">{capitalizeFLetter(p.project.name)}</p>
                  {p.project.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />{p.project.location}
                    </p>
                  )}
                  <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.project.status === "planning" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                    {capitalizeFLetter(p.project.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="panel rounded-xl">
            <h6 className="mb-3 text-base font-bold text-gray-800 dark:text-white">Meta Info</h6>
            <div className="space-y-2.5">
              {metaItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm last:border-0 dark:border-gray-700"
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox */}
      {state.lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90"
          onClick={() => setState({ lightboxIndex: null })}
        >
          {/* Close */}
          <button
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setState({ lightboxIndex: null })}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          {state.lightboxIndex > 0 && (
            <button
              className="absolute left-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setState({ lightboxIndex: state.lightboxIndex - 1 }); }}
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Image */}
          <img
            src={p.images[state.lightboxIndex]?.image_url}
            alt=""
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {state.lightboxIndex < p.images.length - 1 && (
            <button
              className="absolute right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setState({ lightboxIndex: state.lightboxIndex + 1 }); }}
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm text-white">
            {state.lightboxIndex + 1} / {p.images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default PrivateRouter(PropertyDetail);
