import * as Icons from '../index.web';

function getIconsListForGallery() {
  const icons: string[] = [];
  Object.values(Icons).forEach(component => {
    icons.push(component.name);
  });
  return icons;
}

const iconsList = getIconsListForGallery();
export { iconsList };
