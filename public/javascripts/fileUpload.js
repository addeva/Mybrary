document.addEventListener("DOMContentLoaded", function () {
  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginImageResize);
  FilePond.registerPlugin(FilePondPluginFileEncode);
  FilePond.setOptions({
    sytlePanelAspectRatio: 150 / 100,
    imageResizeTargetHeight: 150,
    imageResizeTargetWidth: 100,
  });
  const inputElement = document.querySelector('input[type="file"]');
  const pond = FilePond.create(inputElement);
  FilePond.parse(document.body);
});
