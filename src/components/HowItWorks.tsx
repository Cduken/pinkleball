const steps = [
  { step: "01", title: "Pick a date", description: "Choose when you want to play on our live calendar." },
  { step: "02", title: "Grab a slot", description: "Select an available court time that works for you." },
  { step: "03", title: "Fill the form", description: "No account needed — just your name and contact." },
  { step: "04", title: "Show up & play", description: "Arrive at the court and enjoy your game!" },
];

const HowItWorks = () => {
  return (
    <section className="bg-pink-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            How it <span className="text-pink-500">works</span>
          </h2>
          <p className="text-gray-400 mt-3 text-sm">Four simple steps to get on the court.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, title, description }) => (
            <div key={step} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                {step}
              </div>
              <h3 className="font-bold text-gray-800">{title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;