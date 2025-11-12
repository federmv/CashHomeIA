import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The browser cannot import JSON files as modules directly.
// To fix this, the JSON content is embedded here instead of being imported from external files.

const resources = {
  en: {
    translation: {
      "header": {
        "dashboard": "Dashboard",
        "invoices": "Invoices",
        "income": "Income",
        "logout": "Logout"
      },
      "dashboard": {
        "title": "Dashboard",
        "totalIncome": "Total Income",
        "totalSpent": "Total Spent",
        "netBalance": "Net Balance",
        "totalInvoices": "Total Invoices",
        "cashFlow": "Cash Flow Over Time",
        "spendingByCategory": "Spending by Category",
        "noSpendingData": "No spending data available."
      },
      "invoices": {
        "title": "All Invoices",
        "uploadTitle": "Upload Invoice",
        "uploadCta": "Click to upload",
        "uploadOr": "or drag and drop",
        "uploadHint": "PDF, DOC, XLS, PNG, JPG",
        "analyzingFile": "Analyzing {{fileName}}...",
        "thisMayTakeAMoment": "This may take a moment.",
        "searchPlaceholder": "Search provider, item...",
        "newInvoice": "New Invoice",
        "provider": "Provider",
        "category": "Category",
        "date": "Date",
        "total": "Total",
        "actions": "Actions",
        "noInvoices": "No Invoices Yet",
        "noInvoicesDescription": "It looks like your invoice list is empty. Get started by uploading a file or adding an entry manually.",
        "addNewInvoice": "Add New Invoice"
      },
      "income": {
        "title": "Income",
        "searchPlaceholder": "Search source, description...",
        "newIncome": "New Income",
        "source": "Source",
        "category": "Category",
        "description": "Description",
        "date": "Date",
        "amount": "Amount",
        "actions": "Actions",
        "noIncome": "No Income Recorded",
        "noIncomeDescription": "Track your earnings by adding your first income entry. Click the button below to get started.",
        "addNewIncome": "Add New Income"
      },
      "chat": {
        "title": "AI Accountant",
        "greeting": "Ask me anything about your finances!",
        "greetingExample": "e.g., \"What was my net balance in November?\"",
        "placeholder": "Ask a question...",
        "error": "Sorry, I couldn't get a response. Please try again."
      },
      "modals": {
        "close": "Close modal",
        "invoiceDetailTitle": "{{provider}}",
        "invoiceDate": "Invoice Date:",
        "items": "Items",
        "itemDescription": "Description",
        "itemQty": "Qty",
        "itemUnitPrice": "Unit Price",
        "itemTotal": "Total",
        "noItems": "No line items were found for this invoice.",
        "subtotal": "Subtotal",
        "tax": "Tax",
        "total": "Total",
        "editInvoice": "Edit Invoice",
        "newInvoice": "New Invoice",
        "provider": "Provider",
        "date": "Date",
        "category": "Category",
        "addItem": "Add Item",
        "saveInvoice": "Save Invoice",
        "editIncome": "Edit Income",
        "newIncome": "New Income Entry",
        "incomeSource": "Income Source",
        "amount": "Amount",
        "descriptionOptional": "Description (Optional)",
        "saveIncome": "Save Income"
      },
      "login": {
        "subtitle": "Your AI-Powered Financial Hub",
        "welcome": "Welcome Back",
        "createAccount": "Create Account",
        "displayName": "Display Name",
        "email": "Email",
        "password": "Password",
        "login": "Login",
        "signUp": "Sign Up",
        "noAccount": "Don't have an account?",
        "haveAccount": "Already have an account?",
        "terms": "By creating an account or signing in, you agree to our terms of service."
      },
      "notifications": {
        "savingInvoice": "Saving invoice...",
        "invoiceSaved": "Invoice saved successfully!",
        "invoiceSaveError": "Could not save invoice.",
        "updatingInvoice": "Updating invoice...",
        "invoiceUpdated": "Invoice updated successfully!",
        "invoiceUpdateError": "Could not update invoice.",
        "deletingInvoice": "Deleting invoice...",
        "invoiceDeleted": "Invoice deleted.",
        "invoiceDeleteError": "Could not delete invoice.",
        "savingIncome": "Saving income...",
        "incomeSaved": "Income saved successfully!",
        "incomeSaveError": "Could not save income.",
        "updatingIncome": "Updating income...",
        "incomeUpdated": "Income updated successfully!",
        "incomeUpdateError": "Could not update income.",
        "deletingIncome": "Deleting income...",
        "incomeDeleted": "Income deleted.",
        "incomeDeleteError": "Could not delete income.",
        "fillProviderAndItems": "Please fill in the provider and ensure all items are complete.",
        "fillSourceAndAmount": "Please fill in the source and enter a positive amount.",
        "fillDisplayName": "Please enter a display name."
      },
      "dateFilters": {
        "all": "All Time",
        "month": "This Month",
        "last30": "Last 30 Days",
        "last7": "Last 7 Days"
      },
      "expenseCategories": {
        "software": "Software & Subscriptions",
        "utilities": "Utilities",
        "office": "Office Supplies",
        "marketing": "Marketing & Advertising",
        "travel": "Travel",
        "meals": "Meals & Entertainment",
        "services": "Professional Services",
        "rent": "Rent & Lease",
        "payroll": "Salaries & Payroll",
        "inventory": "Inventory",
        "other": "Other"
      },
      "incomeCategories": {
        "salary": "Salary",
        "sales": "Sales",
        "freelance": "Freelance",
        "investment": "Investment",
        "rental": "Rental",
        "other": "Other"
      },
      "gemini": {
        "analyzeInvoicePrompt": "Analyze this invoice in {{language}} and extract the provider name, invoice date, subtotal (amount before tax), tax amount, and total amount. Also extract all line items, including a description, quantity, unit price, and line total for each item. Finally, suggest a category for this expense from the following list: [{{categories}}]. The date should be in YYYY-MM-DD format.",
        "chatSystemInstruction": "You are CashHome's expert AI accountant. You are friendly, insightful, and help users understand their financial data (invoices and income). Your response must be in {{language}}. Analyze the provided JSON data to answer questions accurately. Provide concise and clear answers. If a question cannot be answered from the data, say so politely. You can answer questions about expenses, income, and net balance/profit.",
        "invoiceAnalysisError": "Failed to analyze the invoice. The AI model could not process the file."
      }
    }
  },
  es: {
    translation: {
      "header": {
        "dashboard": "Panel",
        "invoices": "Facturas",
        "income": "Ingresos",
        "logout": "Cerrar Sesión"
      },
      "dashboard": {
        "title": "Panel de Control",
        "totalIncome": "Ingresos Totales",
        "totalSpent": "Gastos Totales",
        "netBalance": "Balance Neto",
        "totalInvoices": "Facturas Totales",
        "cashFlow": "Flujo de Caja",
        "spendingByCategory": "Gastos por Categoría",
        "noSpendingData": "No hay datos de gastos disponibles."
      },
      "invoices": {
        "title": "Todas las Facturas",
        "uploadTitle": "Subir Factura",
        "uploadCta": "Haz clic para subir",
        "uploadOr": "o arrastra y suelta",
        "uploadHint": "PDF, DOC, XLS, PNG, JPG",
        "analyzingFile": "Analizando {{fileName}}...",
        "thisMayTakeAMoment": "Esto puede tardar un momento.",
        "searchPlaceholder": "Buscar proveedor, artículo...",
        "newInvoice": "Nueva Factura",
        "provider": "Proveedor",
        "category": "Categoría",
        "date": "Fecha",
        "total": "Total",
        "actions": "Acciones",
        "noInvoices": "Aún no hay Facturas",
        "noInvoicesDescription": "Tu lista de facturas está vacía. Empieza subiendo un archivo o añadiendo una entrada manualmente.",
        "addNewInvoice": "Añadir Nueva Factura"
      },
      "income": {
        "title": "Ingresos",
        "searchPlaceholder": "Buscar fuente, descripción...",
        "newIncome": "Nuevo Ingreso",
        "source": "Fuente",
        "category": "Categoría",
        "description": "Descripción",
        "date": "Fecha",
        "amount": "Monto",
        "actions": "Acciones",
        "noIncome": "No hay Ingresos Registrados",
        "noIncomeDescription": "Haz un seguimiento de tus ganancias añadiendo tu primer ingreso. Haz clic en el botón de abajo para empezar.",
        "addNewIncome": "Añadir Nuevo Ingreso"
      },
      "chat": {
        "title": "Contable IA",
        "greeting": "¡Pregúntame lo que sea sobre tus finanzas!",
        "greetingExample": "ej: \"¿Cuál fue mi balance neto en Noviembre?\"",
        "placeholder": "Haz una pregunta...",
        "error": "Lo siento, no pude obtener una respuesta. Por favor, inténtalo de nuevo."
      },
      "modals": {
        "close": "Cerrar modal",
        "invoiceDetailTitle": "{{provider}}",
        "invoiceDate": "Fecha de Factura:",
        "items": "Artículos",
        "itemDescription": "Descripción",
        "itemQty": "Cant.",
        "itemUnitPrice": "Precio Unit.",
        "itemTotal": "Total",
        "noItems": "No se encontraron artículos para esta factura.",
        "subtotal": "Subtotal",
        "tax": "Impuesto",
        "total": "Total",
        "editInvoice": "Editar Factura",
        "newInvoice": "Nueva Factura",
        "provider": "Proveedor",
        "date": "Fecha",
        "category": "Categoría",
        "addItem": "Añadir Artículo",
        "saveInvoice": "Guardar Factura",
        "editIncome": "Editar Ingreso",
        "newIncome": "Nueva Entrada de Ingreso",
        "incomeSource": "Fuente de Ingreso",
        "amount": "Monto",
        "descriptionOptional": "Descripción (Opcional)",
        "saveIncome": "Guardar Ingreso"
      },
      "login": {
        "subtitle": "Tu Centro Financiero con IA",
        "welcome": "Bienvenido de Nuevo",
        "createAccount": "Crear Cuenta",
        "displayName": "Nombre de Usuario",
        "email": "Correo Electrónico",
        "password": "Contraseña",
        "login": "Iniciar Sesión",
        "signUp": "Registrarse",
        "noAccount": "¿No tienes una cuenta?",
        "haveAccount": "¿Ya tienes una cuenta?",
        "terms": "Al crear una cuenta o iniciar sesión, aceptas nuestros términos de servicio."
      },
      "notifications": {
        "savingInvoice": "Guardando factura...",
        "invoiceSaved": "¡Factura guardada con éxito!",
        "invoiceSaveError": "No se pudo guardar la factura.",
        "updatingInvoice": "Actualizando factura...",
        "invoiceUpdated": "¡Factura actualizada con éxito!",
        "invoiceUpdateError": "No se pudo actualizar la factura.",
        "deletingInvoice": "Eliminando factura...",
        "invoiceDeleted": "Factura eliminada.",
        "invoiceDeleteError": "No se pudo eliminar la factura.",
        "savingIncome": "Guardando ingreso...",
        "incomeSaved": "¡Ingreso guardado con éxito!",
        "incomeSaveError": "No se pudo guardar el ingreso.",
        "updatingIncome": "Actualizando ingreso...",
        "incomeUpdated": "¡Ingreso actualizado con éxito!",
        "incomeUpdateError": "No se pudo actualizar el ingreso.",
        "deletingIncome": "Eliminando ingreso...",
        "incomeDeleted": "Ingreso eliminado.",
        "incomeDeleteError": "No se pudo eliminar el ingreso.",
        "fillProviderAndItems": "Por favor, rellena el proveedor y asegúrate de que todos los artículos estén completos.",
        "fillSourceAndAmount": "Por favor, rellena la fuente e introduce un monto positivo.",
        "fillDisplayName": "Por favor, introduce un nombre de usuario."
      },
      "dateFilters": {
        "all": "Siempre",
        "month": "Este Mes",
        "last30": "Últimos 30 Días",
        "last7": "Últimos 7 Días"
      },
      "expenseCategories": {
        "software": "Software y Suscripciones",
        "utilities": "Servicios Públicos",
        "office": "Material de Oficina",
        "marketing": "Marketing y Publicidad",
        "travel": "Viajes",
        "meals": "Comidas y Entretenimiento",
        "services": "Servicios Profesionales",
        "rent": "Alquiler y Arrendamiento",
        "payroll": "Salarios y Nóminas",
        "inventory": "Inventario",
        "other": "Otro"
      },
      "incomeCategories": {
        "salary": "Salario",
        "sales": "Ventas",
        "freelance": "Freelance",
        "investment": "Inversión",
        "rental": "Alquiler",
        "other": "Otro"
      },
      "gemini": {
        "analyzeInvoicePrompt": "Analiza esta factura en {{language}} y extrae el nombre del proveedor, la fecha de la factura, el subtotal (monto antes de impuestos), el monto del impuesto y el monto total. Extrae también todos los artículos, incluyendo descripción, cantidad, precio unitario y total de línea para cada uno. Finalmente, sugiere una categoría para este gasto de la siguiente lista: [{{categories}}]. La fecha debe estar en formato AAAA-MM-DD.",
        "chatSystemInstruction": "Eres el experto contable de IA de CashHome. Eres amigable, perspicaz y ayudas a los usuarios a entender sus datos financieros (facturas e ingresos). Tu respuesta debe ser en {{language}}. Analiza los datos JSON proporcionados para responder preguntas con precisión. Ofrece respuestas concisas y claras. Si una pregunta no puede responderse con los datos, dilo amablemente. Puedes responder preguntas sobre gastos, ingresos y balance neto/ganancias.",
        "invoiceAnalysisError": "Fallo al analizar la factura. El modelo de IA no pudo procesar el archivo."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;