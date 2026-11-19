const API_URL = "https://saberflow-api-lpna.onrender.com";

let currentUser = null;
let disciplinesData = [];
let pendingReviews = [];
let historyReviews = [];
let editingDisciplineId = null;

let flashcardsData = [];
let rescheduleHistory = JSON.parse(localStorage.getItem("saberflow_reschedules") || "[]");
let pendingRescheduleId = null;

// --- INTERNACIONALIZAÇÃO (PT / EN / ES) ---
const I18N = {
  "pt-BR": {
    locale: "pt-BR",
    weekly_progress: "Progresso semanal",
    auth_overline: "Aprenda no seu ritmo",
    auth_h1: "Conhecimento que flui com você.",
    auth_desc: "Planeje seus estudos, acompanhe cada conquista e mantenha o foco no que realmente importa.",
    auth_tagline: "Aprender. Evoluir. Conquistar.",
    login_overline: "Bem-vindo de volta",
    login_title: "Continue sua jornada",
    login_sub: "Acesse sua conta e retome seus estudos de onde parou.",
    email_label: "E-mail",
    password_label: "Senha",
    forgot_password: "Esqueci minha senha",
    login_btn: "Entrar",
    new_here: "Novo por aqui?",
    create_account_btn: "Criar minha conta",
    reg_overline: "Comece agora",
    reg_title: "Crie sua conta",
    reg_sub: "Organize seus estudos e avance no seu próprio ritmo.",
    name_label: "Nome",
    reg_btn: "Cadastrar",
    already_account: "Já tem uma conta?",
    back_login: "Voltar para o login",
    rec_overline: "Recupere seu acesso",
    rec_title: "Redefinir senha",
    rec_sub: "Informe seu e-mail cadastrado e defina uma nova senha segura.",
    rec_email_label: "E-mail cadastrado",
    new_password_label: "Nova senha",
    rec_btn: "Atualizar senha",
    student_role: "Estudante",
    space: "Espaço de estudo",
    nav_overview: "Visão geral",
    nav_disciplines: "Disciplinas",
    nav_reviews: "Revisões",
    nav_performance: "Desempenho",
    nav_history: "Histórico",
    nav_flashcards: "Flashcards",
    nav_settings: "Configurações",
    streak_days: "7 dias seguidos",
    streak_sub: "Continue assim!",
    logout: "Sair",
    welcome_title: "Olá! Bom estudo.",
    new_discipline: "Nova disciplina",
    review_alert_title: "Alerta de revisão",
    review_alert_sub: "Prioridades de hoje",
    see_all_reviews: "Ver todas as revisões",
    week_perf_title: "Desempenho da semana",
    week_perf_sub: "Meta diária e revisões",
    reviews_done_label: "das revisões concluídas",
    daily_goal_cfg: "Meta diária configurada",
    keep_pace: "Mantenha o ritmo",
    done_reviews_label: "Revisões concluídas",
    active_cycles: "Ciclos ativos",
    my_subjects_title: "Minhas disciplinas",
    my_subjects_sub: "Acompanhe seu progresso de aprendizado",
    manage_btn: "Gerenciar",
    see_all_subjects: "Ver todas as disciplinas",
    org_overline: "Organização",
    subjects_page_sub: "Gerencie matérias, tópicos e ciclos de revisão.",
    spaced_rev_overline: "Revisão espaçada",
    reviews_queue_title: "Fila de revisões",
    reviews_queue_sub: "Revise no momento certo para transformar estudo em memória de longo prazo.",
    access_flashcards: "Acessar flashcards",
    filter_subject: "Disciplina",
    all_option: "Todas",
    filter_status: "Status",
    all_status_option: "Todos",
    status_late: "Atrasado",
    status_today: "Hoje",
    status_pending: "Pendente",
    study_history_btn: "Histórico de estudos",
    active_mem_overline: "Memorização ativa",
    flashcards_hub_title: "Central de flashcards",
    flashcards_hub_sub: "Crie cartões de estudo e revise os conceitos essenciais das suas disciplinas.",
    new_flashcard_title: "Novo flashcard",
    new_flashcard_sub: "Adicione uma pergunta e a resposta.",
    question_label: "Pergunta",
    answer_label: "Resposta",
    save_flashcard_btn: "Salvar flashcard",
    your_flashcards_title: "Seus flashcards",
    all_levels_option: "Todos os níveis",
    level_new: "Novo",
    level_review: "Em revisão",
    level_mastered: "Dominado",
    history_overline: "Registro de aprendizagem",
    history_sub: "Consulte todas as revisões concluídas e acompanhe sua consistência.",
    export_pdf_btn: "Exportar PDF",
    th_date: "Data conclusão",
    th_topic: "Tópico",
    th_cycle: "Ciclo",
    perf_overline: "Evolução",
    perf_title: "Desempenho e estatísticas",
    perf_sub: "Entenda seu ritmo de aprendizagem e ajuste sua rotina com dados.",
    back_overview: "Voltar à visão geral",
    kpi_active_discs: "Disciplinas ativas",
    kpi_registered: "cadastradas na conta",
    kpi_rate: "Taxa de conclusão",
    kpi_cycles_done: "Ciclos realizados",
    kpi_goal: "Meta diária",
    kpi_per_day: "revisões por dia",
    kpi_total_hist: "no histórico total",
    bar_chart_title: "Rendimento por disciplina",
    bar_chart_sub: "Aproveitamento estimado",
    donut_chart_title: "Distribuição de status",
    donut_chart_sub: "Situação das revisões",
    donut_done_lbl: "concluído",
    leg_done_lbl: "Concluídas",
    leg_pend_lbl: "Em dia / Pendentes",
    leg_late_lbl: "Em atraso",
    profile_overline: "Sua conta",
    profile_title: "Perfil do Estudante",
    profile_sub: "Atualize seus dados e meta diária de estudo.",
    stat_subjects: "disciplinas",
    stat_goal_day: "meta/dia",
    stat_reviews: "revisões",
    personal_info_title: "Informações pessoais",
    full_name_label: "Nome completo",
    course_label: "Curso",
    daily_goal_label: "Meta diária de revisões",
    save_changes_btn: "Salvar alterações",
    settings_overline: "Preferências",
    settings_sub: "Personalize a aparência, notificações e comportamento do SaberFlow.",
    appearance_title: "Aparência",
    appearance_sub: "Escolha como o SaberFlow aparece para você.",
    theme_light: "Tema claro",
    theme_light_sub: "Interface clara atual",
    theme_dark: "Tema escuro",
    theme_dark_sub: "Confortável à noite",
    compact_mode_title: "Visualização compacta",
    compact_mode_sub: "Reduz o espaçamento dos cartões e tabelas.",
    notif_title: "Notificações",
    notif_sub: "Controle os avisos que deseja receber.",
    notif_rev_title: "Lembretes de revisão",
    notif_rev_sub: "Alertas de revisões próximas ou atrasadas.",
    notif_week_title: "Resumo semanal",
    notif_week_sub: "Relatório de desempenho toda segunda-feira.",
    general_title: "Geral",
    general_sub: "Idioma e preferências da aplicação.",
    lang_label: "Idioma",
    week_start_label: "Início da semana",
    monday_opt: "Segunda-feira",
    sunday_opt: "Domingo",
    privacy_title: "Privacidade e conta",
    privacy_sub: "Gerencie seus dados e sua sessão.",
    change_pass_title: "Alterar senha",
    change_pass_sub: "Atualize sua credencial de acesso.",
    download_data_title: "Baixar meus dados",
    download_data_sub: "Baixe uma cópia em JSON das suas informações.",
    modal_new_disc: "NOVA DISCIPLINA",
    modal_study_reg: "Cadastro de estudo",
    disc_name_label: "Nome da disciplina",
    topic_name_label: "Assunto / Tópico",
    initial_date_label: "Data do estudo inicial",
    cycles_legend: "Ciclos de revisão automáticos (selecione):",
    cancel_btn: "Cancelar",
    save_schedule_btn: "Salvar e agendar revisões",
    security_overline: "SEGURANÇA",
    new_pass_min6: "Nova senha (mínimo 6 caracteres)",
    save_new_pass_btn: "Salvar nova senha",
    prefs_saved: "Preferências atualizadas!",
    fc_created: "Flashcard criado com sucesso!",
    fc_mastered: "Cartão marcado como dominado!",
    fc_deleted: "Flashcard excluído.",
    days_week: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  },
  "en-US": {
    locale: "en-US",
    weekly_progress: "Weekly progress",
    auth_overline: "Learn at your own pace",
    auth_h1: "Knowledge that flows with you.",
    auth_desc: "Plan your studies, track every milestone, and stay focused on what truly matters.",
    auth_tagline: "Learn. Evolve. Achieve.",
    login_overline: "Welcome back",
    login_title: "Continue your journey",
    login_sub: "Sign in to your account and pick up right where you left off.",
    email_label: "Email",
    password_label: "Password",
    forgot_password: "Forgot my password",
    login_btn: "Sign in",
    new_here: "New here?",
    create_account_btn: "Create my account",
    reg_overline: "Get started",
    reg_title: "Create your account",
    reg_sub: "Organize your studies and progress at your own pace.",
    name_label: "Name",
    reg_btn: "Sign up",
    already_account: "Already have an account?",
    back_login: "Back to login",
    rec_overline: "Recover access",
    rec_title: "Reset password",
    rec_sub: "Enter your registered email and set a new secure password.",
    rec_email_label: "Registered email",
    new_password_label: "New password",
    rec_btn: "Update password",
    student_role: "Student",
    space: "Study space",
    nav_overview: "Overview",
    nav_disciplines: "Subjects",
    nav_reviews: "Reviews",
    nav_performance: "Performance",
    nav_history: "History",
    nav_flashcards: "Flashcards",
    nav_settings: "Settings",
    streak_days: "7-day streak",
    streak_sub: "Keep it up!",
    logout: "Log out",
    welcome_title: "Hello! Happy studying.",
    new_discipline: "New subject",
    review_alert_title: "Review alert",
    review_alert_sub: "Today's priorities",
    see_all_reviews: "See all reviews",
    week_perf_title: "Weekly performance",
    week_perf_sub: "Daily goal and reviews",
    reviews_done_label: "of reviews completed",
    daily_goal_cfg: "Configured daily goal",
    keep_pace: "Keep the pace",
    done_reviews_label: "Completed reviews",
    active_cycles: "Active cycles",
    my_subjects_title: "My subjects",
    my_subjects_sub: "Track your learning progress",
    manage_btn: "Manage",
    see_all_subjects: "See all subjects",
    org_overline: "Organization",
    subjects_page_sub: "Manage subjects, topics, and review cycles.",
    spaced_rev_overline: "Spaced repetition",
    reviews_queue_title: "Review queue",
    reviews_queue_sub: "Review at the right time to turn study into long-term memory.",
    access_flashcards: "Go to flashcards",
    filter_subject: "Subject",
    all_option: "All",
    filter_status: "Status",
    all_status_option: "All",
    status_late: "Overdue",
    status_today: "Today",
    status_pending: "Pending",
    study_history_btn: "Study history",
    active_mem_overline: "Active recall",
    flashcards_hub_title: "Flashcards hub",
    flashcards_hub_sub: "Create study cards and review key concepts across your subjects.",
    new_flashcard_title: "New flashcard",
    new_flashcard_sub: "Add a question and its answer.",
    question_label: "Question",
    answer_label: "Answer",
    save_flashcard_btn: "Save flashcard",
    your_flashcards_title: "Your flashcards",
    all_levels_option: "All levels",
    level_new: "New",
    level_review: "In review",
    level_mastered: "Mastered",
    history_overline: "Learning log",
    history_sub: "Review all completed sessions and track your consistency.",
    export_pdf_btn: "Export PDF",
    th_date: "Completion date",
    th_topic: "Topic",
    th_cycle: "Cycle",
    perf_overline: "Progress",
    perf_title: "Performance and stats",
    perf_sub: "Understand your study rhythm and adjust your routine with data.",
    back_overview: "Back to overview",
    kpi_active_discs: "Active subjects",
    kpi_registered: "registered in account",
    kpi_rate: "Completion rate",
    kpi_cycles_done: "Cycles completed",
    kpi_goal: "Daily goal",
    kpi_per_day: "reviews per day",
    kpi_total_hist: "in total history",
    bar_chart_title: "Performance by subject",
    bar_chart_sub: "Estimated mastery",
    donut_chart_title: "Status distribution",
    donut_chart_sub: "Reviews breakdown",
    donut_done_lbl: "completed",
    leg_done_lbl: "Completed",
    leg_pend_lbl: "On track / Pending",
    leg_late_lbl: "Overdue",
    profile_overline: "Your account",
    profile_title: "Student Profile",
    profile_sub: "Update your details and daily study goal.",
    stat_subjects: "subjects",
    stat_goal_day: "goal/day",
    stat_reviews: "reviews",
    personal_info_title: "Personal information",
    full_name_label: "Full name",
    course_label: "Degree / Program",
    daily_goal_label: "Daily review goal",
    save_changes_btn: "Save changes",
    settings_overline: "Preferences",
    settings_sub: "Customize SaberFlow's appearance, notifications, and behavior.",
    appearance_title: "Appearance",
    appearance_sub: "Choose how SaberFlow looks to you.",
    theme_light: "Light theme",
    theme_light_sub: "Current bright interface",
    theme_dark: "Dark theme",
    theme_dark_sub: "Comfortable at night",
    compact_mode_title: "Compact view",
    compact_mode_sub: "Reduces card and table spacing.",
    notif_title: "Notifications",
    notif_sub: "Control the alerts you want to receive.",
    notif_rev_title: "Review reminders",
    notif_rev_sub: "Alerts for upcoming or overdue reviews.",
    notif_week_title: "Weekly summary",
    notif_week_sub: "Performance report every Monday.",
    general_title: "General",
    general_sub: "Language and app preferences.",
    lang_label: "Language",
    week_start_label: "Week start",
    monday_opt: "Monday",
    sunday_opt: "Sunday",
    privacy_title: "Privacy and account",
    privacy_sub: "Manage your data and session.",
    change_pass_title: "Change password",
    change_pass_sub: "Update your sign-in credential.",
    download_data_title: "Download my data",
    download_data_sub: "Download a JSON copy of your information.",
    modal_new_disc: "NEW SUBJECT",
    modal_study_reg: "Study registration",
    disc_name_label: "Subject name",
    topic_name_label: "Subject / Topic",
    initial_date_label: "Initial study date",
    cycles_legend: "Automatic review cycles (select):",
    cancel_btn: "Cancel",
    save_schedule_btn: "Save and schedule reviews",
    security_overline: "SECURITY",
    new_pass_min6: "New password (minimum 6 characters)",
    save_new_pass_btn: "Save new password",
    prefs_saved: "Preferences updated!",
    fc_created: "Flashcard created successfully!",
    fc_mastered: "Card marked as mastered!",
    fc_deleted: "Flashcard deleted.",
    days_week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  "es": {
    locale: "es-ES",
    weekly_progress: "Progreso semanal",
    auth_overline: "Aprende a tu ritmo",
    auth_h1: "Conocimiento que fluye contigo.",
    auth_desc: "Planifica tus estudios, sigue cada logro y mantén el enfoque en lo que importa.",
    auth_tagline: "Aprender. Evolucionar. Lograr.",
    login_overline: "Bienvenido de nuevo",
    login_title: "Continúa tu recorrido",
    login_sub: "Accede a tu cuenta y retoma tus estudios donde lo dejaste.",
    email_label: "Correo electrónico",
    password_label: "Contraseña",
    forgot_password: "Olvidé mi contraseña",
    login_btn: "Iniciar sesión",
    new_here: "¿Nuevo por aquí?",
    create_account_btn: "Crear mi cuenta",
    reg_overline: "Empieza ahora",
    reg_title: "Crea tu cuenta",
    reg_sub: "Organiza tus estudios y avanza a tu propio ritmo.",
    name_label: "Nombre",
    reg_btn: "Registrarse",
    already_account: "¿Ya tienes una cuenta?",
    back_login: "Volver al inicio de sesión",
    rec_overline: "Recupera tu acceso",
    rec_title: "Restablecer contraseña",
    rec_sub: "Ingresa tu correo registrado y define una nueva contraseña segura.",
    rec_email_label: "Correo registrado",
    new_password_label: "Nueva contraseña",
    rec_btn: "Actualizar contraseña",
    student_role: "Estudiante",
    space: "Espacio de estudio",
    nav_overview: "Resumen",
    nav_disciplines: "Asignaturas",
    nav_reviews: "Repasos",
    nav_performance: "Rendimiento",
    nav_history: "Historial",
    nav_flashcards: "Flashcards",
    nav_settings: "Configuración",
    streak_days: "7 días seguidos",
    streak_sub: "¡Sigue así!",
    logout: "Salir",
    welcome_title: "¡Hola! Buen estudio.",
    new_discipline: "Nueva asignatura",
    review_alert_title: "Alerta de repaso",
    review_alert_sub: "Prioridades de hoy",
    see_all_reviews: "Ver todos los repasos",
    week_perf_title: "Rendimiento semanal",
    week_perf_sub: "Meta diaria y repasos",
    reviews_done_label: "de repasos completados",
    daily_goal_cfg: "Meta diaria configurada",
    keep_pace: "Mantén el ritmo",
    done_reviews_label: "Repasos completados",
    active_cycles: "Ciclos activos",
    my_subjects_title: "Mis asignaturas",
    my_subjects_sub: "Sigue tu progreso de aprendizaje",
    manage_btn: "Gestionar",
    see_all_subjects: "Ver todas las asignaturas",
    org_overline: "Organización",
    subjects_page_sub: "Gestiona materias, temas y ciclos de repaso.",
    spaced_rev_overline: "Repetición espaciada",
    reviews_queue_title: "Cola de repasos",
    reviews_queue_sub: "Repasa en el momento justo para convertir el estudio en memoria a largo plazo.",
    access_flashcards: "Ir a flashcards",
    filter_subject: "Asignatura",
    all_option: "Todas",
    filter_status: "Estado",
    all_status_option: "Todos",
    status_late: "Atrasado",
    status_today: "Hoy",
    status_pending: "Pendiente",
    study_history_btn: "Historial de estudios",
    active_mem_overline: "Memorización activa",
    flashcards_hub_title: "Centro de flashcards",
    flashcards_hub_sub: "Crea tarjetas de estudio y repasa conceptos clave de tus asignaturas.",
    new_flashcard_title: "Nueva flashcard",
    new_flashcard_sub: "Agrega una pregunta y su respuesta.",
    question_label: "Pregunta",
    answer_label: "Respuesta",
    save_flashcard_btn: "Guardar flashcard",
    your_flashcards_title: "Tus flashcards",
    all_levels_option: "Todos los niveles",
    level_new: "Nuevo",
    level_review: "En repaso",
    level_mastered: "Dominado",
    history_overline: "Registro de aprendizaje",
    history_sub: "Consulta todos los repasos completados y sigue tu constancia.",
    export_pdf_btn: "Exportar PDF",
    th_date: "Fecha finalización",
    th_topic: "Tema",
    th_cycle: "Ciclo",
    perf_overline: "Evolución",
    perf_title: "Rendimiento y estadísticas",
    perf_sub: "Comprende tu ritmo de aprendizaje y ajusta tu rutina con datos.",
    back_overview: "Volver al resumen",
    kpi_active_discs: "Asignaturas activas",
    kpi_registered: "registradas en la cuenta",
    kpi_rate: "Tasa de finalización",
    kpi_cycles_done: "Ciclos realizados",
    kpi_goal: "Meta diaria",
    kpi_per_day: "repasos por día",
    kpi_total_hist: "en el historial total",
    bar_chart_title: "Rendimiento por asignatura",
    bar_chart_sub: "Aprovechamiento estimado",
    donut_chart_title: "Distribución de estado",
    donut_chart_sub: "Situación de los repasos",
    donut_done_lbl: "completado",
    leg_done_lbl: "Completados",
    leg_pend_lbl: "Al día / Pendientes",
    leg_late_lbl: "Atrasados",
    profile_overline: "Tu cuenta",
    profile_title: "Perfil del Estudiante",
    profile_sub: "Actualiza tus datos y tu meta diaria de estudio.",
    stat_subjects: "asignaturas",
    stat_goal_day: "meta/día",
    stat_reviews: "repasos",
    personal_info_title: "Información personal",
    full_name_label: "Nombre completo",
    course_label: "Carrera / Programa",
    daily_goal_label: "Meta diaria de repasos",
    save_changes_btn: "Guardar cambios",
    settings_overline: "Preferencias",
    settings_sub: "Personaliza la apariencia, notificaciones y comportamiento de SaberFlow.",
    appearance_title: "Apariencia",
    appearance_sub: "Elige cómo se ve SaberFlow para ti.",
    theme_light: "Tema claro",
    theme_light_sub: "Interfaz clara actual",
    theme_dark: "Tema oscuro",
    theme_dark_sub: "Cómodo por la noche",
    compact_mode_title: "Vista compacta",
    compact_mode_sub: "Reduce el espaciado de tarjetas y tablas.",
    notif_title: "Notificaciones",
    notif_sub: "Controla los avisos que deseas recibir.",
    notif_rev_title: "Recordatorios de repaso",
    notif_rev_sub: "Alertas de repasos próximos o atrasados.",
    notif_week_title: "Resumen semanal",
    notif_week_sub: "Informe de rendimiento cada lunes.",
    general_title: "General",
    general_sub: "Idioma y preferencias de la aplicación.",
    lang_label: "Idioma",
    week_start_label: "Inicio de semana",
    monday_opt: "Lunes",
    sunday_opt: "Domingo",
    privacy_title: "Privacidad y cuenta",
    privacy_sub: "Gestiona tus datos y tu sesión.",
    change_pass_title: "Cambiar contraseña",
    change_pass_sub: "Actualiza tu credencial de acceso.",
    download_data_title: "Descargar mis datos",
    download_data_sub: "Descarga una copia en JSON de tu información.",
    modal_new_disc: "NUEVA ASIGNATURA",
    modal_study_reg: "Registro de estudio",
    disc_name_label: "Nombre de la asignatura",
    topic_name_label: "Asunto / Tema",
    initial_date_label: "Fecha de estudio inicial",
    cycles_legend: "Ciclos de repaso automáticos (selecciona):",
    cancel_btn: "Cancelar",
    save_schedule_btn: "Guardar y programar repasos",
    security_overline: "SEGURIDAD",
    new_pass_min6: "Nueva contraseña (mínimo 6 caracteres)",
    save_new_pass_btn: "Guardar nueva contraseña",
    prefs_saved: "¡Preferencias actualizadas!",
    fc_created: "¡Flashcard creada con éxito!",
    fc_mastered: "¡Tarjeta marcada como dominada!",
    fc_deleted: "Flashcard eliminada.",
    days_week: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  }
};

function getLang() {
  const lang = document.getElementById("cfg-lang")?.value || localStorage.getItem("saberflow_lang") || "pt-BR";
  return I18N[lang] ? lang : "pt-BR";
}

function t(key) {
  const lang = getLang();
  return I18N[lang][key] ?? I18N["pt-BR"][key] ?? key;
}

function applyLanguage(lang) {
  const validLang = I18N[lang] ? lang : "pt-BR";
  localStorage.setItem("saberflow_lang", validLang);
  document.documentElement.lang = validLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    const val = I18N[validLang][k];
    if (typeof val === "string") el.innerText = val;
  });

  const dateLabel = document.getElementById("today-date-label");
  if (dateLabel && currentUser) {
    dateLabel.innerText = new Date().toLocaleDateString(I18N[validLang].locale, {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  if (currentUser) {
    const firstName = currentUser.nome.split(" ")[0];
    if (validLang === "en-US") {
      document.getElementById("welcome-title").innerText = `Hello, ${firstName}! Happy studying.`;
      document.getElementById("welcome-subtitle").innerText = `You have ${pendingReviews.length} pending reviews in your queue.`;
    } else if (validLang === "es") {
      document.getElementById("welcome-title").innerText = `¡Hola, ${firstName}! Buen estudio.`;
      document.getElementById("welcome-subtitle").innerText = `Tienes ${pendingReviews.length} repasos pendientes en la fila.`;
    } else {
      document.getElementById("welcome-title").innerText = `Olá, ${firstName}! Bom estudo.`;
      document.getElementById("welcome-subtitle").innerText = `Você tem ${pendingReviews.length} revisões pendentes na fila.`;
    }
  }

  renderWeekStartBadge();
}

function getOrderedWeekDays(weekStart) {
  const days = [...t("days_week")];
  if (weekStart === "monday") {
    const sunday = days.shift();
    days.push(sunday);
  }
  return days;
}

function renderWeekStartBadge() {
  const weekStart = document.getElementById("cfg-week-start")?.value || "monday";
  const ordered = getOrderedWeekDays(weekStart);
  const perfCard = document.querySelector("#page-performance .charts-grid");
  if (!perfCard) return;

  let strip = document.getElementById("week-order-strip");
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "week-order-strip";
    strip.className = "card-sf mt-3";
    strip.style.padding = "14px 20px";
    strip.style.gridColumn = "1 / -1";
    perfCard.appendChild(strip);
  }
  strip.innerHTML = `<small style="opacity:.75;">${t("week_start_label")}: </small><b>${ordered.join(" · ")}</b>`;
}

// --- FLASHCARDS POR USUÁRIO ---
function getFlashcardStorageKey() {
  return currentUser?.id ? `saberflow_flashcards_${currentUser.id}` : "saberflow_flashcards_guest";
}

function loadUserFlashcards() {
  const key = getFlashcardStorageKey();
  const raw = localStorage.getItem(key);

  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      flashcardsData = Array.isArray(parsed) ? parsed : [];
      return;
    } catch {
      flashcardsData = [];
      return;
    }
  }

  // Migra dados legados apenas uma vez se existirem e ainda não houver chave do usuário
  const legacyRaw = localStorage.getItem("saberflow_flashcards");
  if (legacyRaw !== null && currentUser?.id) {
    try {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        flashcardsData = legacyParsed;
        saveFlashcardsLocal();
        return;
      }
    } catch {}
  }

  flashcardsData = [
    { id: 1, discipline: "Banco de Dados", question: "O que é normalização em um banco de dados?", answer: "É o processo de organizar tabelas para reduzir redundância e melhorar a integridade dos dados.", level: "Em revisão", open: false },
    { id: 2, discipline: "Python", question: "Qual é a diferença entre uma lista e uma tupla?", answer: "Listas são mutáveis e usam colchetes; tuplas são imutáveis e usam parênteses.", level: "Dominado", open: false }
  ];
  saveFlashcardsLocal();
}

function saveFlashcardsLocal() {
  localStorage.setItem(getFlashcardStorageKey(), JSON.stringify(flashcardsData));
}

// --- UTILITÁRIOS ---
function showToast(msg) {
  const box = document.getElementById("toast-box");
  document.getElementById("toast-msg").innerText = msg;
  box.style.display = "flex";
  setTimeout(() => { box.style.display = "none"; }, 3500);
}

function fecharToast() {
  document.getElementById("toast-box").style.display = "none";
}

function togglePass(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("saberflow_theme", theme);
  document.getElementById("btn-theme-light").classList.toggle("selected", theme === "light");
  document.getElementById("btn-theme-dark").classList.toggle("selected", theme === "dark");
}

function toggleCompactMode() {
  const isCompact = document.getElementById("cfg-compact").checked;
  document.body.classList.toggle("compact-mode", isCompact);
  saveSettingsPrefs();
}

function saveSettingsPrefs() {
  const prefs = {
    compact: document.getElementById("cfg-compact").checked,
    notifRev: document.getElementById("cfg-notif-rev").checked,
    notifWeek: document.getElementById("cfg-notif-week").checked,
    lang: document.getElementById("cfg-lang").value,
    weekStart: document.getElementById("cfg-week-start").value
  };
  localStorage.setItem("saberflow_prefs", JSON.stringify(prefs));
  applyLanguage(prefs.lang);
  showToast(t("prefs_saved"));
}

function loadSettingsPrefs() {
  const prefs = JSON.parse(localStorage.getItem("saberflow_prefs") || "null");
  if (!prefs) {
    applyLanguage("pt-BR");
    return;
  }
  document.getElementById("cfg-compact").checked = !!prefs.compact;
  document.body.classList.toggle("compact-mode", !!prefs.compact);
  document.getElementById("cfg-notif-rev").checked = prefs.notifRev !== false;
  document.getElementById("cfg-notif-week").checked = prefs.notifWeek !== false;
  if (prefs.lang) document.getElementById("cfg-lang").value = prefs.lang;
  if (prefs.weekStart) document.getElementById("cfg-week-start").value = prefs.weekStart;
  applyLanguage(prefs.lang || "pt-BR");
}

// --- AUTENTICAÇÃO ---
function switchAuth(mode) {
  ["login", "register", "recover"].forEach(m => {
    document.getElementById(`auth-${m}`).style.display = m === mode ? "block" : "none";
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    if (!res.ok) {
      const err = await res.json();
      return showToast(err.detail || "E-mail ou senha inválidos.");
    }
    currentUser = await res.json();
    iniciarSessao();
  } catch (err) {
    showToast("Erro ao conectar com a API FastAPI. Verifique se o uvicorn está rodando.");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const nome = document.getElementById("reg-nome").value;
  const email = document.getElementById("reg-email").value;
  const senha = document.getElementById("reg-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
    if (!res.ok) {
      const err = await res.json();
      return showToast(err.detail || "Erro ao cadastrar.");
    }
    showToast("Conta criada com sucesso! Faça seu login.");
    switchAuth("login");
  } catch (err) {
    showToast("Erro de conexão com o servidor.");
  }
}

async function handleRecover(e) {
  e.preventDefault();
  const email = document.getElementById("rec-email").value;
  const nova_senha = document.getElementById("rec-senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/redefinir-senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nova_senha })
    });
    if (!res.ok) return showToast("E-mail não encontrado.");
    showToast("Senha alterada com sucesso!");
    switchAuth("login");
  } catch (err) {
    showToast("Erro de conexão com o servidor.");
  }
}

function logout() {
  currentUser = null;
  flashcardsData = [];
  document.getElementById("view-app").style.display = "none";
  document.getElementById("view-auth").style.display = "grid";
}

function iniciarSessao() {
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("view-app").style.display = "grid";

  const iniciais = currentUser.nome.slice(0, 2).toUpperCase();
  document.getElementById("user-initials").innerText = iniciais;
  document.getElementById("user-name-top").innerText = currentUser.nome;
  document.getElementById("welcome-title").innerText = `Olá, ${currentUser.nome.split(" ")[0]}! Bom estudo.`;

  document.getElementById("prof-avatar").innerText = iniciais;
  document.getElementById("prof-name-card").innerText = currentUser.nome;
  document.getElementById("prof-email-card").innerText = currentUser.email || "";
  document.getElementById("prof-input-name").value = currentUser.nome;
  document.getElementById("prof-input-email").value = currentUser.email || "";
  document.getElementById("prof-input-meta").value = currentUser.meta_diaria || 3;

  loadSettingsPrefs();
  loadUserFlashcards();
  loadAllData();
}

// --- NAVEGAÇÃO ---
function navigate(viewName) {
  document.querySelectorAll(".app-page").forEach(p => p.style.display = "none");
  document.getElementById(`page-${viewName}`).style.display = "block";

  document.querySelectorAll("#sidebar-nav button").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  if (viewName === "performance") renderPerformance();
  if (viewName === "flashcards") renderFlashcards();
}

// --- CARREGAMENTO DE DADOS ---
async function loadAllData() {
  if (!currentUser) return;
  try {
    const [resDisc, resRev] = await Promise.all([
      fetch(`${API_URL}/disciplinas/${currentUser.id}`),
      fetch(`${API_URL}/revisoes/${currentUser.id}`)
    ]);

    disciplinesData = await resDisc.json();
    const revJson = await resRev.json();
    pendingReviews = revJson.pendentes || [];
    historyReviews = revJson.historico || [];

    atualizarSelectsDisciplinas();
    renderOverview();
    renderDisciplines();
    renderReviews();
    renderHistory();
    renderPerformance();
    applyLanguage(getLang());
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

function atualizarSelectsDisciplinas() {
  const selects = ["filter-rev-disc", "fc-filter-disc", "fc-disc-select"];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id !== "fc-disc-select";
    el.innerHTML = (isFilter ? `<option value="Todas">${t("all_option")}</option>` : "") +
      disciplinesData.map(d => `<option value="${d.nome}">${d.nome}</option>`).join("");
  });
}

// --- RENDER: VISÃO GERAL ---
function renderOverview() {
  document.getElementById("welcome-subtitle").innerText = `Você tem ${pendingReviews.length} revisões pendentes na fila.`;
  document.getElementById("ov-pending-badge").innerText = `${pendingReviews.length} pendentes`;

  const ovList = document.getElementById("ov-pending-list");
  ovList.innerHTML = pendingReviews.slice(0, 3).map(r => `
    <button class="mini-row" onclick="navigate('reviews')">
      <span class="initial">${r.disciplina.slice(0, 2).toUpperCase()}</span>
      <span><b>${r.disciplina}</b><small>${r.topico}</small></span>
      <em>Ciclo ${r.intervalo_dias}d</em>
    </button>
  `).join("") || `<p class="text-muted small mt-3">Nenhuma revisão pendente no momento.</p>`;

  const totalCiclos = pendingReviews.length + historyReviews.length;
  const pct = totalCiclos > 0 ? Math.round((historyReviews.length / totalCiclos) * 100) : 0;

  document.getElementById("ov-percent").innerText = `${pct}%`;
  document.getElementById("ov-progress-bar").style.width = `${pct}%`;
  document.getElementById("ov-meta-display").innerText = `${currentUser.meta_diaria || 3}/dia`;
  document.getElementById("ov-done-ratio").innerText = `${historyReviews.length} / ${totalCiclos}`;

  const subjList = document.getElementById("ov-subjects-list");
  subjList.innerHTML = disciplinesData.slice(0, 4).map(d => {
    const concluidasDisc = historyReviews.filter(h => h.disciplina === d.nome).length;
    const pendentesDisc = pendingReviews.filter(p => p.disciplina === d.nome).length;
    const tot = concluidasDisc + pendentesDisc;
    const prog = tot > 0 ? Math.round((concluidasDisc / tot) * 100) : 0;

    return `
      <button class="subject-row" onclick="navigate('disciplines')">
        <span class="initial">${d.nome.slice(0, 2).toUpperCase()}</span>
        <span class="subject-name"><b>${d.nome}</b><small>${tot} ciclos programados</small></span>
        <span class="row-progress"><div class="progress-sf"><i style="width:${prog}%"></i></div></span>
        <b>${prog}%</b>
        <i class="fa-solid fa-chevron-right" style="font-size:11px;color:#94a3b8;"></i>
      </button>
    `;
  }).join("") || `<p class="text-muted small mt-2">Cadastre sua primeira disciplina para começar.</p>`;

  document.getElementById("prof-stat-discs").innerText = disciplinesData.length;
  document.getElementById("prof-stat-meta").innerText = currentUser.meta_diaria || 3;
  document.getElementById("prof-stat-done").innerText = historyReviews.length;
}

// --- RENDER: DISCIPLINAS ---
function renderDisciplines() {
  const grid = document.getElementById("disciplines-grid");
  if (!disciplinesData.length) {
    grid.innerHTML = `<div class="empty card-sf"><h4>Nenhuma disciplina cadastrada</h4><p>Clique em "+ Nova disciplina" para começar sua jornada.</p></div>`;
    return;
  }

  grid.innerHTML = disciplinesData.map(d => {
    const concluidas = historyReviews.filter(h => h.disciplina === d.nome).length;
    const pendentes = pendingReviews.filter(p => p.disciplina === d.nome).length;
    const total = concluidas + pendentes;
    const prog = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return `
      <article class="card-sf discipline-card">
        <div class="discipline-top">
          <span class="large-initial">${d.nome.slice(0, 2).toUpperCase()}</span>
          <div>
            <h2>${d.nome}</h2>
            <p>${d.topico_titulo || "Ciclos ativos"}</p>
          </div>
          <div class="icon-actions">
            <button onclick="openEditDisciplineModal(${d.id})" title="Editar disciplina"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteDiscipline(${d.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div class="discipline-meta">
          <span><b>${d.total_topicos || 1}</b> tópicos</span>
          <span><b>${pendentes}</b> revisões pendentes</span>
        </div>
        <div class="progress-label"><span>Progresso geral</span><b>${prog}%</b></div>
        <div class="progress-sf"><i style="width:${prog}%"></i></div>
      </article>
    `;
  }).join("");
}

function openDisciplineModal() {
  editingDisciplineId = null;
  document.getElementById("modal-disc-overline").innerText = t("modal_new_disc");
  document.getElementById("modal-disc-title").innerText = t("modal_study_reg");
  document.getElementById("modal-disc-submit").innerText = t("save_schedule_btn");
  document.getElementById("modal-disc-name").value = "";
  document.getElementById("modal-topic-name").value = "";
  document.getElementById("modal-study-date").value = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[name="ciclo-opt"]').forEach(cb => cb.checked = true);
  document.getElementById("modal-discipline").style.display = "grid";
}

function openEditDisciplineModal(id) {
  const disc = disciplinesData.find(d => d.id === id);
  if (!disc) return;

  editingDisciplineId = id;
  document.getElementById("modal-disc-overline").innerText = "EDITAR DISCIPLINA";
  document.getElementById("modal-disc-title").innerText = "Atualize os dados";
  document.getElementById("modal-disc-submit").innerText = t("save_changes_btn");
  document.getElementById("modal-disc-name").value = disc.nome;
  document.getElementById("modal-topic-name").value = disc.topico_titulo || "";
  document.getElementById("modal-study-date").value = disc.data_inicial || new Date().toISOString().split("T")[0];

  const ativos = disc.ciclos_ativos || [1, 7, 15, 30];
  document.querySelectorAll('input[name="ciclo-opt"]').forEach(cb => {
    cb.checked = ativos.includes(parseInt(cb.value));
  });

  document.getElementById("modal-discipline").style.display = "grid";
}

function closeDisciplineModal() {
  document.getElementById("modal-discipline").style.display = "none";
}

async function saveDiscipline(e) {
  e.preventDefault();
  const nome = document.getElementById("modal-disc-name").value;
  const topico_titulo = document.getElementById("modal-topic-name").value;
  const data_inicial = document.getElementById("modal-study-date").value;
  const ciclos = Array.from(document.querySelectorAll('input[name="ciclo-opt"]:checked')).map(cb => parseInt(cb.value));

  if (!ciclos.length) {
    return showToast("Selecione pelo menos um ciclo de revisão.");
  }

  try {
    if (editingDisciplineId) {
      await fetch(`${API_URL}/disciplinas/${editingDisciplineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, topico_titulo, data_inicial, ciclos })
      });
      showToast("Disciplina atualizada com sucesso!");
    } else {
      await fetch(`${API_URL}/disciplinas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, usuario_id: currentUser.id, topico_titulo, data_inicial, ciclos })
      });
      showToast(`${nome} cadastrada com ciclos automáticos!`);
    }

    closeDisciplineModal();
    loadAllData();
  } catch (err) {
    showToast("Erro ao salvar disciplina.");
  }
}

async function deleteDiscipline(id) {
  if (!confirm("Deseja realmente excluir esta disciplina e seus ciclos?")) return;
  await fetch(`${API_URL}/disciplinas/${id}`, { method: "DELETE" });
  showToast("Disciplina removida.");
  loadAllData();
}

// --- RENDER: REVISÕES ---
function renderReviews() {
  const fDisc = document.getElementById("filter-rev-disc").value;
  const fStat = document.getElementById("filter-rev-status").value;

  const filtradas = pendingReviews.filter(r => {
    const matchD = fDisc === "Todas" || r.disciplina === fDisc;
    const matchS = fStat === "Todos" || r.status === fStat;
    return matchD && matchS;
  });

  const list = document.getElementById("reviews-list");
  if (!filtradas.length) {
    list.innerHTML = `<div class="empty card-sf"><h4>Tudo em dia!</h4><p>Nenhuma revisão encontrada para os filtros selecionados.</p></div>`;
    return;
  }

  list.innerHTML = filtradas.map(r => {
    const isLate = r.status === "Atrasado";
    const isToday = r.status === "Hoje";
    const badgeClass = isLate ? "atrasado" : (isToday ? "hoje" : "pendente");

    return `
      <article class="card-sf review-item ${badgeClass}">
        <div class="status-rail"></div>
        <span class="status-tag ${badgeClass}">${r.status}</span>
        <div class="review-info">
          <small>${r.disciplina}</small>
          <h2>${r.topico}</h2>
          <p>Ciclo de ${r.intervalo_dias} dias · Prevista para ${r.data_prevista}</p>
        </div>
        <div class="review-actions">
          <button class="btn-sf outline" type="button" onclick="openRescheduleModal(${r.ciclo_id})">
            <i class="fa-regular fa-calendar"></i> Adiar / Reagendar
          </button>
          <button class="btn-sf primary" type="button" onclick="concluirRevisao(${r.ciclo_id})">
            <i class="fa-solid fa-check"></i> Concluir revisão
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function openRescheduleModal(cicloId) {
  const rev = pendingReviews.find(r => r.ciclo_id === cicloId);
  if (!rev) return;
  pendingRescheduleId = cicloId;

  const hojeISO = new Date().toISOString().split("T")[0];
  const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  let modal = document.getElementById("reschedule-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "reschedule-modal";
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }

  modal.style.display = "grid";
  modal.innerHTML = `
    <div class="modal-sf">
      <div class="modal-heading">
        <div>
          <p class="overline">REAGENDAR REVISÃO</p>
          <h2>${rev.topico}</h2>
        </div>
        <button type="button" onclick="closeRescheduleModal()">&times;</button>
      </div>
      <p style="margin:0 0 16px;font-size:12px;color:#64748b;">
        Disciplina: <b>${rev.disciplina}</b> · Data atual: <b>${rev.data_prevista}</b>
      </p>
      <label>
        Escolher nova data
        <input type="date" id="reschedule-date" min="${hojeISO}" value="${defaultDate}" onchange="syncDaysFromDate()">
      </label>
      <label>
        Ou escolher prazo em dias a partir de hoje
        <select id="reschedule-days" onchange="syncDateFromDays()">
          <option value="1">+1 dia</option>
          <option value="3">+3 dias</option>
          <option value="7" selected>+7 dias</option>
          <option value="15">+15 dias</option>
          <option value="30">+30 dias</option>
        </select>
      </label>
      <div class="modal-actions">
        <button class="btn-sf outline" type="button" onclick="closeRescheduleModal()">Cancelar</button>
        <button class="btn-sf primary" type="button" onclick="confirmReschedule()">Confirmar nova data</button>
      </div>
    </div>
  `;
}

function closeRescheduleModal() {
  const modal = document.getElementById("reschedule-modal");
  if (modal) modal.style.display = "none";
  pendingRescheduleId = null;
}

function syncDateFromDays() {
  const days = parseInt(document.getElementById("reschedule-days").value, 10) || 7;
  const newDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
  document.getElementById("reschedule-date").value = newDate;
}

function syncDaysFromDate() {
  const val = document.getElementById("reschedule-date").value;
  if (!val) return;
  const diffDays = Math.max(1, Math.round((new Date(val + "T00:00:00") - new Date(new Date().toISOString().split("T")[0] + "T00:00:00")) / 86400000));
  const sel = document.getElementById("reschedule-days");
  const match = Array.from(sel.options).find(o => parseInt(o.value, 10) === diffDays);
  if (match) sel.value = match.value;
}

async function confirmReschedule() {
  if (!pendingRescheduleId) return;
  const cicloId = pendingRescheduleId;
  const novaData = document.getElementById("reschedule-date").value;
  const prazoDias = parseInt(document.getElementById("reschedule-days").value, 10) || 7;
  const rev = pendingReviews.find(r => r.ciclo_id === cicloId);

  if (!novaData) return showToast("Escolha uma data válida para reagendar.");

  try {
    await fetch(`${API_URL}/revisoes/adiar/${cicloId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nova_data: novaData, dias: prazoDias })
    });
  } catch (err) {
    console.warn("Aviso ao notificar API de reagendamento:", err);
  }

  rescheduleHistory.unshift({
    ciclo_id: cicloId,
    disciplina: rev?.disciplina || "",
    topico: rev?.topico || "",
    data_anterior: rev?.data_prevista || "",
    nova_data: novaData,
    prazo_dias: prazoDias,
    reagendado_em: new Date().toISOString()
  });
  localStorage.setItem("saberflow_reschedules", JSON.stringify(rescheduleHistory));

  closeRescheduleModal();
  showToast(`Revisão reagendada para ${novaData}!`);
  await loadAllData();
}

async function concluirRevisao(cicloId) {
  await fetch(`${API_URL}/revisoes/concluir/${cicloId}`, { method: "PUT" });
  showToast("Revisão concluída e enviada ao histórico!");
  loadAllData();
}

// --- RENDER: HISTÓRICO ---
function renderHistory() {
  const q = (document.getElementById("history-search")?.value || "").toLowerCase();
  const filtrados = historyReviews.filter(h =>
    `${h.disciplina} ${h.topico}`.toLowerCase().includes(q)
  );

  document.getElementById("history-tbody").innerHTML = filtrados.map(h => `
    <tr>
      <td>${h.data_realizada}</td>
      <td><b>${h.disciplina}</b></td>
      <td>${h.topico}</td>
      <td>${h.intervalo_dias} dias</td>
      <td><span class="table-status ok">Concluído</span></td>
    </tr>
  `).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum estudo concluído registrado ainda.</td></tr>`;
}

// --- RENDER: FLASHCARDS ---
function addFlashcard(e) {
  e.preventDefault();
  const disc = document.getElementById("fc-disc-select").value || "Geral";
  const question = document.getElementById("fc-question").value;
  const answer = document.getElementById("fc-answer").value;

  flashcardsData.unshift({ id: Date.now(), discipline: disc, question, answer, level: "Novo", open: false });
  saveFlashcardsLocal();
  document.getElementById("fc-question").value = "";
  document.getElementById("fc-answer").value = "";
  showToast(t("fc_created"));
  renderFlashcards();
}

function toggleFlashcard(id) {
  flashcardsData = flashcardsData.map(c => c.id === id ? { ...c, open: !c.open } : c);
  renderFlashcards();
}

function masterFlashcard(id) {
  flashcardsData = flashcardsData.map(c => c.id === id ? { ...c, level: "Dominado" } : c);
  saveFlashcardsLocal();
  showToast(t("fc_mastered"));
  renderFlashcards();
}

function removeFlashcard(id) {
  flashcardsData = flashcardsData.filter(c => c.id !== id);
  saveFlashcardsLocal();
  showToast(t("fc_deleted"));
  renderFlashcards();
}

function renderFlashcards() {
  const fDisc = document.getElementById("fc-filter-disc").value;
  const fLev = document.getElementById("fc-filter-level").value;

  const visiveis = flashcardsData.filter(c =>
    (fDisc === "Todas" || c.discipline === fDisc) &&
    (fLev === "Todos" || c.level === fLev)
  );

  document.getElementById("fc-count").innerText = `${visiveis.length} cartões disponíveis`;
  const grid = document.getElementById("flashcards-grid");

  if (!visiveis.length) {
    grid.innerHTML = `<div class="empty card-sf"><p>Nenhum flashcard encontrado.</p></div>`;
    return;
  }

  grid.innerHTML = visiveis.map(c => `
    <article class="card-sf study-card">
      <div class="study-card-top">
        <span>${c.discipline}</span>
        <em class="${c.level === "Dominado" ? "level-dominado" : ""}">${c.level}</em>
      </div>
      <div class="study-card-content">
        <small>${c.open ? t("answer_label") : t("question_label")}</small>
        <h2>${c.open ? c.answer : c.question}</h2>
      </div>
      <button class="flip-button" type="button" onclick="toggleFlashcard(${c.id})">
        <i class="fa-solid fa-rotate"></i> ${c.open ? "Ocultar resposta" : "Mostrar resposta"}
      </button>
      <div class="study-card-actions">
        <button type="button" onclick="masterFlashcard(${c.id})"><i class="fa-solid fa-check"></i> ${t("level_mastered")}</button>
        <button type="button" onclick="removeFlashcard(${c.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>
  `).join("");
}

// --- RENDER: DESEMPENHO ---
function renderPerformance() {
  const done = historyReviews.length;
  const pend = pendingReviews.filter(r => r.status !== "Atrasado").length;
  const late = pendingReviews.filter(r => r.status === "Atrasado").length;
  const total = done + pend + late;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById("perf-discs").innerText = disciplinesData.length;
  document.getElementById("perf-rate").innerText = `${rate}%`;
  document.getElementById("perf-meta").innerText = currentUser?.meta_diaria || 3;
  document.getElementById("perf-done").innerText = done;

  const barChart = document.getElementById("perf-bar-chart");
  barChart.innerHTML = disciplinesData.map(d => {
    const dDone = historyReviews.filter(h => h.disciplina === d.nome).length;
    const dTot = dDone + pendingReviews.filter(p => p.disciplina === d.nome).length;
    const score = dTot > 0 ? Math.round((dDone / dTot) * 100) : 15;
    return `
      <div class="bar-column">
        <span>${score}%</span>
        <div><i style="height:${score}%"></i></div>
        <small>${d.nome.split(" ")[0]}</small>
      </div>
    `;
  }).join("") || `<p class="text-muted small">Cadastre disciplinas para visualizar o gráfico.</p>`;

  const pDone = total > 0 ? (done / total) * 100 : 0;
  const pPend = total > 0 ? (pend / total) * 100 : 0;
  document.getElementById("perf-donut").style.background =
    total > 0
      ? `conic-gradient(#2563eb 0 ${pDone}%, #8b5cf6 ${pDone}% ${pDone + pPend}%, #ef4444 ${pDone + pPend}% 100%)`
      : `#e2e8f0`;
  document.getElementById("perf-donut-val").innerText = `${rate}%`;
  document.getElementById("leg-done").innerText = done;
  document.getElementById("leg-pend").innerText = pend;
  document.getElementById("leg-late").innerText = late;

  renderWeekStartBadge();
}

// --- PERFIL & SENHA ---
async function saveProfile(e) {
  e.preventDefault();
  const novaMeta = parseInt(document.getElementById("prof-input-meta").value) || 3;
  await fetch(`${API_URL}/usuarios/${currentUser.id}/meta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meta_diaria: novaMeta })
  });
  currentUser.meta_diaria = novaMeta;
  showToast("Perfil e meta diária atualizados!");
  renderOverview();
}

function openPasswordModal() {
  document.getElementById("modal-new-pass").value = "";
  document.getElementById("modal-password").style.display = "grid";
}

function closePasswordModal() {
  document.getElementById("modal-password").style.display = "none";
}

async function submitChangePassword(e) {
  e.preventDefault();
  const nova_senha = document.getElementById("modal-new-pass").value;
  try {
    const res = await fetch(`${API_URL}/auth/redefinir-senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUser.email, nova_senha })
    });
    if (!res.ok) return showToast("Não foi possível alterar a senha.");
    closePasswordModal();
    showToast("Senha alterada com sucesso!");
  } catch {
    showToast("Erro ao conectar com o servidor.");
  }
}

function exportDataJSON() {
  const payload = { usuario: currentUser, disciplinas: disciplinesData, pendentes: pendingReviews, historico: historyReviews, flashcards: flashcardsData };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "saberflow-backup.json";
  a.click();
}

function filtrarGlobal() {
  const termo = document.getElementById("global-search-input").value.toLowerCase();
  if (!termo) return;
  navigate("disciplines");
}

const savedTheme = localStorage.getItem("saberflow_theme");
if (savedTheme === "dark") setTheme("dark");