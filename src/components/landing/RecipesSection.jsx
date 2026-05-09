import { FaArrowRightLong } from "react-icons/fa6";
import { MdSchedule } from "react-icons/md";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import elderberryImg from "../../assets/recipe_elderberry.png";
import lavenderImg from "../../assets/recipe_lavender.png";
import mintImg from "../../assets/recipe_mint.png";
import gingerImg from "../../assets/recipe_ginger.png";

const MotionDiv = motion.div;

function RecipesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const recipes = [
    {
      image: elderberryImg,
      tagKey: "recipes.recipe1.tag",
      timeKey: "recipes.recipe1.time",
      titleKey: "recipes.recipe1.title",
      descriptionKey: "recipes.recipe1.description",
    },
    {
      image: lavenderImg,
      tagKey: "recipes.recipe2.tag",
      timeKey: "recipes.recipe2.time",
      titleKey: "recipes.recipe2.title",
      descriptionKey: "recipes.recipe2.description",
    },
    {
      image: mintImg,
      tagKey: "recipes.recipe3.tag",
      timeKey: "recipes.recipe3.time",
      titleKey: "recipes.recipe3.title",
      descriptionKey: "recipes.recipe3.description",
    },
    {
      image: gingerImg,
      tagKey: "recipes.recipe4.tag",
      timeKey: "recipes.recipe4.time",
      titleKey: "recipes.recipe4.title",
      descriptionKey: "recipes.recipe4.description",
    },
  ];

  return (
    <section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <MotionDiv
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45 }}
      >
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {t("recipes.title")}
          </h2>
          <p className="text-slate-600">{t("recipes.description")}</p>
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
                alt={t(recipe.titleKey)}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  {t(recipe.tagKey)}
                </span>
                <div className="flex items-center text-slate-400 text-xs font-medium">
                  <MdSchedule className="text-sm mx-1" />
                  {t(recipe.timeKey)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                {t(recipe.titleKey)}
              </h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
                {t(recipe.descriptionKey)}
              </p>

              <Link
                to="/auth"
                className="inline-flex w-full items-center justify-center py-2.5 bg-primary-light/50 hover:bg-primary-light text-primary font-bold text-sm rounded-xl transition-colors"
              >
                {t("recipes.viewRecipe")}
              </Link>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}

export default RecipesSection;
