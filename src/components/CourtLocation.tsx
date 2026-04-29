import { MapPin} from "lucide-react";

const CourtLocation = () => {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Find us on the <span className="text-pink-500">map</span>
          </h2>
          <p className="text-gray-400 mt-3 text-sm">
            Come visit us — we're easy to find and ready to play.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-md border border-pink-100 h-80">
            <iframe
              title="Court Location"
              src="https://www.google.com/maps/embed?pb=!4v1777434742827!6m8!1m7!1siksilb8lEACImJSWhGyHYQ!2m2!1d9.91828338139814!2d123.9299344977633!3f9.989550380048158!4f-17.07334130028353!5f0.7820865974627469"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-pink-50 border border-pink-100">
              <h3 className="font-extrabold text-gray-800 text-lg mb-4">
                Court Info
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-xl mt-0.5">
                    <MapPin className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Address
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Cahayag, Tubigon,
                      <br /> Bohol, Philippines
                    </p>
                  </div>
                </div>

               

              </div>
            </div>

            <a
              href="https://maps.google.com/?q=9.91828338139814,123.9299344977633"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourtLocation;
