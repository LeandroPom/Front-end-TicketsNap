export function PaymentFailed() {
  return (
    <div className="fixed top-[180px] left-0 right-0 flex flex-col items-center justify-center mx-auto max-w-md px-6 py-8 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Pago cancelado o fallido</h1>
      <p className="mb-6 text-gray-700">
        Tu pago no se completó. Por favor, intenta nuevamente.
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  );
}
