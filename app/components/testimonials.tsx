import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  title: string;
  company: string;
  image: string;
  logo: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      quote:
        "SignaTrust has revolutionized our contract management process. The KYC verification gives us confidence that we're doing business with verified entities, and the digital signature process is seamless. We've cut our contract processing time by 70%.",
      name: "Sarah Johnson",
      title: "Legal Operations Director",
      company: "Meridian Law Partners",
      image: "/images/testimonials/sarah-johnson.jpg",
      logo: "/images/testimonials/meridian-logo.svg",
      rating: 5,
    },
    {
      id: 2,
      quote:
        "As a financial institution, compliance is our top priority. SignaTrust's identity verification and security features meet all our regulatory requirements while providing an intuitive experience for our clients. The audit trail has been invaluable during compliance reviews.",
      name: "Michael Chang",
      title: "VP of Digital Banking",
      company: "Horizon Financial",
      image: "/images/testimonials/michael-chang.jpg",
      logo: "/images/testimonials/horizon-logo.svg",
      rating: 5,
    },
    {
      id: 3,
      quote:
        "We process hundreds of property transactions monthly, and SignaTrust has streamlined our entire workflow. Remote signing capabilities have increased our closing rate significantly, and clients love the ease of use. The platform's security features give everyone peace of mind.",
      name: "Rebecca Torres",
      title: "Operations Manager",
      company: "Evergreen Real Estate",
      image: "/images/testimonials/rebecca-torres.jpg",
      logo: "/images/testimonials/evergreen-logo.svg",
      rating: 5,
    },
    {
      id: 4,
      quote:
        "Our HR department onboards employees globally, which presented significant paperwork challenges. SignaTrust solved this with their compliant e-signature process. Onboarding time decreased from days to hours, and our compliance team is thrilled with the audit capabilities.",
      name: "David Okonkwo",
      title: "Global HR Director",
      company: "NexGen Technologies",
      image: "/images/testimonials/david-okonkwo.jpg",
      logo: "/images/testimonials/nexgen-logo.svg",
      rating: 4,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400" : "text-gray-600"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section
      className="py-24 bg-gray-900 relative overflow-hidden"
      id="testimonials"
    >
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-900/20 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary-900/20 to-transparent opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Trusted by Industry Leaders
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            See how organizations across industries are transforming their
            document workflows with SignaTrust.
          </motion.p>
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        {/* Placeholder for company logo */}
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg text-sm text-gray-400">
                          {testimonial.company.substring(0, 1)}
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-semibold text-white">
                            {testimonial.company}
                          </p>
                          <div className="flex mt-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex">
                        <svg
                          className="h-10 w-10 text-primary-500 opacity-80"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>

                    <blockquote className="text-gray-300 text-lg italic mb-8">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center">
                      {/* Placeholder for person image */}
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                        {testimonial.name.substring(0, 1)}
                      </div>
                      <div className="ml-4">
                        <p className="text-white font-medium">
                          {testimonial.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === activeIndex
                    ? "bg-primary-500"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              ></button>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="hidden md:block">
            <button
              onClick={() =>
                setActiveIndex(
                  (activeIndex - 1 + testimonials.length) % testimonials.length
                )
              }
              className="absolute top-1/2 -left-12 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setActiveIndex((activeIndex + 1) % testimonials.length)
              }
              className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 pt-10 border-t border-gray-800"
        >
          <p className="text-center text-gray-400 mb-8">
            Trusted by 10,000+ businesses worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                {/* Placeholder for company logos */}
                <div className="h-8 bg-gray-700 rounded w-24 opacity-50"></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <p className="text-4xl font-bold text-primary-400 mb-2">99.9%</p>
            <p className="text-gray-300">Uptime Reliability</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <p className="text-4xl font-bold text-primary-400 mb-2">5M+</p>
            <p className="text-gray-300">Documents Processed</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <p className="text-4xl font-bold text-primary-400 mb-2">30+</p>
            <p className="text-gray-300">Countries Served</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
