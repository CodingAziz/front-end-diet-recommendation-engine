import { Recipe } from "../types";
// maps backend recipe → frontend recipe
const attachImageLink = (recipe: any): Recipe => ({
  ...recipe,
  image_link: recipe.image_link ?? "", // placeholder for now
});

export default attachImageLink;