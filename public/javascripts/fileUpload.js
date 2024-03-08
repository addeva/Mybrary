const rootStyles = window.getComputedStyle(document.documentElement);

const coverWidth = parseFloat(
  rootStyles.getPropertyValue("--book-cover-width-large")
);

if (coverWidth != null && coverWidth !== "") {
  ready();
} else {
  document.getElementById("main_css").addEventListener("load", ready);
}

function ready() {
  const coverAspectRatio = parseFloat(
    rootStyles.getPropertyValue("--book-cover-aspect-ratio")
  );
  const coverHeight = coverWidth / coverAspectRatio;

  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginImageResize);
  FilePond.registerPlugin(FilePondPluginFileEncode);

  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio, // Fixed typo
    imageResizeTargetHeight: coverHeight,
    imageResizeTargetWidth: coverWidth,
  });

  const inputElement = document.querySelector('input[type="file"]');
  const pond = FilePond.create(inputElement);
  FilePond.parse(document.body);
}
