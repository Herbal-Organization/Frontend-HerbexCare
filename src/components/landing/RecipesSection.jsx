import {FaArrowRightLong} from "react-icons/fa6";
import {MdSchedule} from "react-icons/md";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import elderberryImg from "../../assets/recipe_elderberry.png";
import lavenderImg from "../../assets/recipe_lavender.png";
import mintImg from "../../assets/recipe_mint.png";
import gingerImg from "../../assets/recipe_ginger.png";

const MotionDiv = motion.div;

function RecipesSection() {
  const recipes = [
    {
      image: elderberryImg,
      tag: "IMMUNITY",
      time: "10m",
      title: "Golden Elderberry Infusion",
      description: "A potent blend designed to strengthen your natural defenses."
    },
    {
      image: lavenderImg,
      tag: "SLEEP",
      time: "15m",
      title: "Midnight Lavender Mist",
      description: "Calming aromas and herbs to prepare your body for deep rest."
    },
    {
      image: mintImg,
      tag: "ENERGY",
      time: "5m",
      title: "Revitalizing Mint Tonic",
      description: "A refreshing kick to start your day without the caffeine crash."
    },
    {
      image: gingerImg,
      tag: "DIGESTION",
      time: "12m",
      title: "Ginger Root Soother",
      description: "Gentle warmth for a happy stomach and better digestion."
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45 }}
      >
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Featured AI Recipes</h2>
          <p className="text-slate-600">Discover what our community is brewing this week, then explore full collections tailored to your goals.</p>
        </div>
        
      </MotionDiv>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe, idx) => (
          <MotionDiv
            key={idx}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col transition-shadow hover:shadow-md"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <div className="h-48 w-full overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {recipe.tag}
                </span>
                <div className="flex items-center text-slate-400 text-xs font-medium">
                  <MdSchedule className="text-sm mr-1" />
                  {recipe.time}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{recipe.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
                {recipe.description}
              </p>
              
              <Link
                to="/auth"
                className="inline-flex w-full items-center justify-center py-2.5 bg-primary-light/50 hover:bg-primary-light text-primary font-bold text-sm rounded-xl transition-colors"
              >
                View Recipe
              </Link>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}

export default RecipesSection;
