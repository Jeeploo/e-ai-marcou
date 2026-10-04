export async function lookupPostalCode(value: string) {
  const cep = value.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) throw new Error("Informe um CEP com 8 números.");
  if (!navigator.onLine)
    throw new Error(
      "Conecte-se para buscar o CEP ou preencha o endereço manualmente.",
    );
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(
      "Não foi possível buscar o CEP. Preencha o endereço manualmente.",
    );
  const data = await response.json();
  if (data.erro)
    throw new Error(
      "CEP não encontrado. Confira os números ou preencha manualmente.",
    );
  if (typeof data.localidade !== "string" || typeof data.uf !== "string")
    throw new Error("Resposta do CEP indisponível. Preencha manualmente.");
  return {
    rua: String(data.logradouro || ""),
    bairro: String(data.bairro || ""),
    cidade: data.localidade as string,
    uf: data.uf as string,
  };
}
