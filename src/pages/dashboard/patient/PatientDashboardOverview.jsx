import React from "react";
import {
  FaInfoCircle,
  FaTruck,
  FaHeart,
  FaArrowUp,
  FaClock,
  FaPills,
  FaLeaf,
  FaArrowRight,
} from "react-icons/fa";

function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Prescriptions</p>
            <h3 className="text-3xl font-bold mt-2">3</h3>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <FaPills />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
          <FaInfoCircle className="text-sm" />
          <span>All current plans up to date</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Recent Orders</p>
            <h3 className="text-3xl font-bold mt-2">12</h3>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <FaTruck />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
          <FaArrowUp className="text-sm" />
          <span>+2% from last month</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Health Score</p>
            <h3 className="text-3xl font-bold mt-2 text-primary">88%</h3>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <FaHeart />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
          <FaArrowUp className="text-sm" />
          <span>+5% health improvement</span>
        </div>
      </div>
    </div>
  );
}

function RecommendedRecipes() {
  const cards = [
    {
      title: "Chamomile & Lavender infusion",
      tag: "Stress Relief",
      tagColor: "bg-primary",
      minutes: "15 mins",
      description:
        "A calming blend designed to reduce anxiety and promote restful sleep using organic herbs.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA5gqoLxmyBbNzRAvF3b_zFZ8kJK80pKr7vjGni1lbx9BM32WWs-zIspG4vC7W5etVPpH9EovkAocxoIoEdqj-Xgef6i0-6QjLJ-so4g7SzczduKtY6GnTW8KkBJnuZHLsRkPaexCqgH4M4mOHuY2q6Om3D9eLxAV4VL_LyDQo5KqJbnps9JC90TefWZFlzAAdlC4RKEvb1_So4jE-hWihh92n3K4yYWpUuaiSvNBcJdtRNvvxCZFvgUm8VrNXMopBL9jHd1f9QXWQ",
    },
    {
      title: "Turmeric & Ginger Elixir",
      tag: "Immunity",
      tagColor: "bg-orange-500",
      minutes: "10 mins",
      description:
        "Powerful anti-inflammatory booster to support your immune system during seasonal changes.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUBXLeCGhkyk3y4RsBryuMI-kji_zcca4XB2Yr-IqMASCNuXDLJUZyi2DaPaXNln5T7Q3ZF75Wj6sFFLww1XOzyH0U08ethpYAJvOECijzcnQDUeylUBjKL0qy9tf9uDYNcMu1YoE7RV_fXs1bUbWPh1BC0Fm261xKRZjCvwuveTkEfwTPktDqYqvqz_gCVIwvaBk-tyKp7AqebZLjHxYroBxJBdTNcFPpYmtvQgDV2Pnc95BTOu4Ve2fPzrjvRzkkl6nC0-5EAAI",
    },
    {
      title: "Fresh Peppermint Tonic",
      tag: "Digestion",
      tagColor: "bg-blue-500",
      minutes: "5 mins",
      description:
        "A refreshing digestive aid that helps soothe the stomach and refresh your senses.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA7fQcqC90B5UXHmx0B--1xBfkWwJp0nwXz8jJmzsDV2SCYLa6UqbyxFefNccFfGGvZFsUyoBPVbeeozIJKF36_xEDCtOT9NIWoSzLByERYcLcoX8xMfyqYhpKnB8wu7jHcukc4t3oagHxjLy3fpixGn9ke4I4N-4GIF2O_TUR9Cq7qe_88tJ5PHKv_u-mKpEa05awXvK3vSthL0cNKuR0NmtZIne-KG-t2s2SIPIt8QmyygUQhyRsdOeMeT3Svw0_jS6VR9_sR_f0",
    },
  ];

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FaLeaf className="text-primary" />
          <span>Recommended for You</span>
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-primary hover:underline"
        >
          View all recipes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <article
            key={card.title}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group"
          >
            <div className="relative h-48">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4">
                <span
                  className={`${card.tagColor} px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider`}
                >
                  {card.tag}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">{card.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FaClock className="text-base" />
                  <span>{card.minutes}</span>
                </div>
                <button
                  type="button"
                  className="text-primary font-bold text-sm flex items-center gap-1"
                >
                  View Recipe
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UpcomingRefills() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Upcoming Refills</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
              <FaPills />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Adaptogen Morning Blend</p>
              <p className="text-xs text-slate-500">Auto-refill in 4 days</p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-primary px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10"
            >
              Manage
            </button>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
              <FaLeaf />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Relaxation Loose Leaf Tea</p>
              <p className="text-xs text-slate-500">Auto-refill in 12 days</p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-primary px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <FaLeaf className="text-primary" />
          <h3 className="text-lg font-bold">AI Wellness Insight</h3>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed italic">
          &quot;Based on your recent sleep patterns, increasing your intake of Magnesium-rich
          herbs like Nettle or Horsetail in the evening could help improve your REM cycle by
          15%. Would you like to add Nettle extract to your next delivery?&quot;
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Add to next order
          </button>
          <button
            type="button"
            className="bg-white text-slate-600 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200"
          >
            Tell me more
          </button>
        </div>
      </div>
    </section>
  );
}

function PatientDashboardOverview({ user }) {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">
          Here is your herbal wellness overview for today.
        </p>
      </section>

      <StatsCards />
      <RecommendedRecipes />
      <UpcomingRefills />
    </div>
  );
}

export default PatientDashboardOverview;

