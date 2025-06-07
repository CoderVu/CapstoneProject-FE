// Ensure Image constructor is used correctly
if (typeof window !== 'undefined') {
  const OriginalImage = window.Image;
  window.Image = function() {
    if (!(this instanceof OriginalImage)) {
      return new OriginalImage(...arguments);
    }
    return OriginalImage.apply(this, arguments);
  };
  window.Image.prototype = OriginalImage.prototype;
}

export default window.Image; 