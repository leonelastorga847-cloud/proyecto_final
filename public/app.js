const modal = document.querySelector('#deleteModal');
const deleteForm = document.querySelector('#deleteForm');

document.querySelectorAll('[data-delete-url]').forEach((button) => {
  button.addEventListener('click', () => {
    deleteForm.action = button.dataset.deleteUrl;
    modal.showModal();
  });
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => modal.close());
});
