import React from "react";
import RecipeCard from "./RecipeCard";

const recipes = [
  {
    id: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQVHK3R2KMld2LJntqktQPmau5Qil_q1DQbTDTGmHANPLTt6trZMhNyHr2-ehV052tV_pz1u7bTLPwdOjOLgrw6VRGkotU91UG7mJNDEwkW42oRkPGUl5dRhwGCJJGfeyZRzVuwMIvKNbmvOOZdX6y8bvRTvD3W0EZBc_U-um4AZTL7OKWt7qbE8m3cF02w3iOne4osrv5wMQI8N4MW4CE1naZAAUWbY3kl_NPisHRor6Z1FwYMEaxf5KhEm4_uQwu-Gm1wm7f9fU",
    title: "Anti-Inflammatory Ginger Tea",
    description:
      "A potent AI-optimized blend featuring fresh ginger and turmeric to reduce systemic inflammation and boost vitality.",
    rating: 4.5,
    reviews: 124,
    time: "15 mins",
    level: "Easy",
    featured: true,
  },
  {
    id: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAA9qDnFWtaHK_0UgRPe2L6p4ELBasnddND2tCjlxTSgLmrvHlVn94Rpxio4YjxuNCigJ1HAuDONBDwn0GG23pRqCZkg_qd3lYJCmoBr0dUcBO6XV3jUwUWIrNz50ccD0oKy63_meZ-497eiYIJcoaABTkq0cuWwVHmGFvGcbcShINqQ7hqHUPpFIF1iAwegOYvAUNNgGhrCJ8RUYsaaSb2pCgpo8QiqkKSj89a1l78PcmR9bEaqNdX3tbjYMGsn5KRtvIxoq3MuUg",
    title: "Elderberry Immune Syrup",
    description:
      "Concentrated syrup with elderberries, cloves, and honey for powerful seasonal immune support.",
    rating: 5,
    reviews: 89,
    time: "45 mins",
    level: "Medium",
    featured: true,
  },
  {
    id: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWy_yYHCjYvZe-NtzSxZsaLqnrdTOvhui5PI7YPgpJkIyskuHDy9gIJb5FGYqoH6b8qvjYUiQ6X6XpXZpOMGyxPdep0TsBxW-VeEVs8fZfP7WgPSafj8-S3p6tGkIO-po30lbaDcGecp9O7PNbG0owDQkgnbG9uKF5_Sa_bv-2v6BXEzsZTiS9DVR7e66LIAr0S07UH8OEZS9Xk3iSQdU8D6KcltbtZXFOm2Ln9QyhCOZVXuDotbz-qXCFVS3b8L8xAH2-OMJ4GvY",
    title: "Soothing Chamomile Poultice",
    description:
      "A traditional external application for skin calming and reducing localized irritation naturally.",
    rating: 4,
    reviews: 56,
    time: "10 mins",
    level: "Beginner",
    featured: false,
  },
  {
    id: 4,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1Qj1oDDvmV6DbUy50YNmud_0sdSQQJWJnNqpw_gXNBm1l4XPiQ76zt0-9t9VPhiF_7GE-RD1zTQ8BQ8kkEu1iqzXKLnXORR5k4s9V1fhsiaMBFQe1-8rsPLfkmRmdQnElybjqsZafSGew1xjz2p57qL-LgFIueKfnQQQHXmmll_s99aXcP5qDrroDjAMUF4ADVdPVI3tXs4WF0tBFvMu2t0PSHvB-YDeZFyGFjI0qtapmyG9EOn0TyYOP7d1EzOkZZrx_fAFm6uE",
    title: "Turmeric Joint Relief Paste",
    description:
      "Highly concentrated AI-formulated paste for localized relief of joint stiffness and soreness.",
    rating: 4,
    reviews: 210,
    time: "20 mins",
    level: "Advanced",
    featured: true,
  },
  {
    id: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxfMWe24mBxAo_GPRKjrIDYIhgAqu9PAFTAWodFTKPdUJkVXCh9tGyEW6RmOen0iO8LaVyFCrtMWRgCd2zmdAbCEEbK0gmjoJQprTTwempWg3SifsEvDWKPotSzb1tgtSppkJtX3OP-aLLk9vfVjp2sytGHkiMx_mlD3Uv8d3l7DlocKreTUgSFRhBlB2yGig6LExBvyVdUnmC-tVU6xbZAX21OkMAL-yzRxwTBP5psN7DT9DlhIE6B4roe7USv5ZxpPGuR6F3Txo",
    title: "Sleep-Well Lavender Mist",
    description:
      "A soothing pillow mist to enhance deep sleep cycles using therapeutic grade lavender and valerian.",
    rating: 5,
    reviews: 342,
    time: "5 mins",
    level: "Easy",
    featured: false,
  },
  {
    id: 6,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7bI44hT-N-jo5WRUG_ujmlO-fAJJAbVTyKxd5yJpdeZvFVzdLAaDtfP6lx5o_AAIWREUbYbX1tUtKqASA7qfY1ZxplJxSdsFiIe-Mu4Rc_vtj2clC9MNxu54pQ3j5f4VCey0rN2b9N9018qO89SSdapCCfYpJRIgskm2tqjNiXVUf9BE4cH2k6wUkZ1wKIdkaLtOiFG1pc0GFTQI4Cg65trjQK2dCGdDy3vPecLZl442tFvbRCCwMUb_mDrPoEMt_HmpQJc-Pxw",
    title: "Digestive Peppermint Tonic",
    description:
      "Quick-acting tonic for digestive discomfort, balanced by AI to ensure optimal peppermint oil concentration.",
    rating: 4,
    reviews: 18,
    time: "5 mins",
    level: "Easy",
    featured: true,
  },
  {
    id: 7,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdiZKc5UPdv6_YuQE7BiiS5WR_OaTPCrOPHyDUS1zyejjK5BcRM6iyx0mJ15ETKPMNJ3lltCQ2XYFpGtbS5UwhJ5pO8LLYFsRi9ZOCR-nmAsOC4ZdteWkRLyffJiy2kZfQT5OwncYqJ7l6BqY6IqcyGuE3h0h3nlBdqINB7cS3iOJgl7kNG0loOukzpl2VuB_GXTKgF40RGyyJwwSTGKafBh83lT2C-mcJsoKNb4kU38e_Tu9_2wLidTY3uCMraKgt58MHFR6nPsE",
    title: "Sage Throat Gargle",
    description:
      "A traditional antiseptic gargle using dried sage and sea salt for instant sore throat relief.",
    rating: 5,
    reviews: 42,
    time: "10 mins",
    level: "Beginner",
    featured: false,
  },
  {
    id: 8,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkM6rQsJUjML3vtO9ufzy6HRU3AJT4Z4Jk905G0AmxXJK8TBLkhf82boUbx5CcjcX9eOwuYT6qcVq89hDVm4JcqQxoMFO4D8DsS4_GZrWm7Fbm29YMo9S9b6Unq4VEJ4-sUXWd-89CgV0qDpQNcUmD8odfv98SUu0YuJbv69pr-tzoDhO_1YP6lkqysPQUdG0MVL0bAOc9hvcuK3nboO_KGv4tTduGp9AV63Fx2ZXlwEd7iCdCLV1hIwOmrrrpT8JuFsJJ4vv0MmE",
    title: "Detox Nettle Infusion",
    description:
      "AI-guided nutrient-rich infusion that leverages stinging nettles for kidney support and blood purification.",
    rating: 4,
    reviews: 115,
    time: "30 mins",
    level: "Medium",
    featured: true,
  },
];

function RecipesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
}

export default RecipesGrid;

