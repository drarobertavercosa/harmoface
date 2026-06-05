// ════════════════════════════════════════════════════════════════════
//  HarmoFace — Formulário de Anamnese · Script
// ════════════════════════════════════════════════════════════════════

// ▶ URL do Google Apps Script (substitua se necessário)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2ovaxTOlp0ut6P3mlFF8Mf5ZtXTFqHqzWWrrBZcidiyVtUBXMhzxPV4s414gSOhCy8g/exec';

// ─── ELEMENTOS ────────────────────────────────────────────────────
const fotoInput   = document.getElementById('foto-input');
const preview     = document.getElementById('photo-preview');
const uploadIcon  = document.getElementById('upload-icon-svg');
const uploadText  = document.getElementById('upload-text');
const btnSubmit   = document.getElementById('btn-submit');
const btnText     = document.getElementById('btn-text');
const btnArrow    = document.getElementById('btn-arrow');
const btnSpinner  = document.getElementById('btn-spinner');
const statusMsg   = document.getElementById('status-message');
const formArea    = document.getElementById('form-area');
const successScr  = document.getElementById('success-screen');

// ─── PHOTO PREVIEW ────────────────────────────────────────────────
fotoInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    uploadIcon.style.display = 'none';
    uploadText.textContent = file.name;
  };
  reader.readAsDataURL(file);
});

// ─── VALIDAÇÃO ────────────────────────────────────────────────────
function validateForm(form) {
  let valid = true;
  ['f-nome', 'f-cpf', 'f-email', 'f-tel'].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;
    const input = field.querySelector('input');
    if (!input.value.trim()) {
      field.classList.add('has-error');
      valid = false;
    } else {
      field.classList.remove('has-error');
    }
  });
  return valid;
}

// ─── COLETA DE DADOS ──────────────────────────────────────────────
function collectFormData(form) {
  const data = {};
  const fd = new FormData(form);

  // Checkboxes — une todos os valores marcados
  ['conheceu', 'motivo'].forEach(name => {
    data[name] = fd.getAll(name).join(', ') || 'Não informado';
  });

  // Demais campos
  for (const [key, value] of fd.entries()) {
    if (!['conheceu', 'motivo', 'foto'].includes(key)) {
      data[key] = value || 'Não informado';
    }
  }

  // Rádios com valor padrão
  ['hemofilia', 'diabetes'].forEach(name => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    data[name] = checked ? checked.value : 'Não';
  });

  return data;
}

// ─── ESTADO DO BOTÃO ──────────────────────────────────────────────
function setBtnLoading(loading) {
  btnSubmit.disabled = loading;
  btnText.textContent = loading ? 'Enviando...' : 'Enviar Ficha';
  btnArrow.style.display  = loading ? 'none' : '';
  btnSpinner.style.display = loading ? 'inline-block' : 'none';
}

// ─── SUBMIT ───────────────────────────────────────────────────────
document.getElementById('anamnese-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateForm(this)) {
    statusMsg.className = 'error';
    statusMsg.textContent = 'Por favor, preencha os campos obrigatórios.';
    statusMsg.style.display = 'block';
    return;
  }

  setBtnLoading(true);

  const formData = collectFormData(this);

  // Encode da foto em base64 (se enviada)
  const fotoFile = fotoInput.files[0];
  if (fotoFile) {
    const reader = new FileReader();
    const base64 = await new Promise(resolve => {
      reader.onload = e => resolve(e.target.result.split(',')[1]);
      reader.readAsDataURL(fotoFile);
    });
    formData.foto_base64 = base64;
    formData.foto_nome   = fotoFile.name;
    formData.foto_tipo   = fotoFile.type;
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'text/plain' },
    });

    const result = await response.json();

    if (result.status === 'ok') {
      formArea.style.display = 'none';
      successScr.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      throw new Error(result.message || 'Erro ao enviar');
    }
  } catch (err) {
    setBtnLoading(false);
    statusMsg.className = 'error';
    statusMsg.textContent = 'Não foi possível enviar a ficha. Verifique sua conexão e tente novamente.' + err;
    statusMsg.style.display = 'block';
  }
});
