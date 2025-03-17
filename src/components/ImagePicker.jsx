export default function ImagePicker({ images, selectedImage, onSelect }) {
    const [imagesOg] = images;
  return (
    <div id="image-picker">
      <p>Select an image</p>
      <ul>
        {imagesOg.map((image) => {
            return (
                <li
                    key={image.path}
                    onClick={() => onSelect(image.path)}
                    className={selectedImage === image.path ? 'selected' : undefined}
                >
                    <img
                        src={`http://localhost:3000/${image.path}`}
                        alt={image.caption}
                    />
                </li>
            )
        })}
      </ul>
    </div>
  );
}
