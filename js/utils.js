export function gerarId(prefixo = "") {
    return `${prefixo}${Date.now()}${Math.floor(Math.random() * 9999)}`;
}

export function gerarCodigoFuncionario() {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}

export function formatarData(data) {

    if (!data) return "-";

    try {

        const d = new Date(data);

        return d.toLocaleString(
            "pt-BR"
        );

    } catch {

        return "-";

    }

}

export function formatarDataCurta(data) {

    if (!data) return "-";

    try {

        const d = new Date(data);

        return d.toLocaleDateString(
            "pt-BR"
        );

    } catch {

        return "-";

    }

}

export function mostrarToast(
    mensagem,
    tipo = "info"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${tipo}`;

    toast.innerHTML = mensagem;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add(
            "toast-show"
        );

    }, 50);

    setTimeout(() => {

        toast.remove();

    }, 4000);

}

export function validarCampos(
    campos = []
) {

    for (const campo of campos) {

        if (
            campo === null ||
            campo === undefined ||
            campo === ""
        ) {

            return false;

        }

    }

    return true;

}

export function calcularTempo(
    inicio,
    fim
) {

    if (!inicio || !fim)
        return "-";

    const diff =
        Math.floor(
            (fim - inicio) / 60000
        );

    const horas =
        Math.floor(diff / 60);

    const minutos =
        diff % 60;

    return `${horas}h ${minutos}min`;

}

export function gerarQr(
    elemento,
    texto
) {

    elemento.innerHTML = "";

    return QRCode.toCanvas(
        texto,
        {
            width: 180
        }
    );

}

export function baixarJson(
    nomeArquivo,
    dados
) {

    const blob =
        new Blob(
            [
                JSON.stringify(
                    dados,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href = url;

    a.download = nomeArquivo;

    a.click();

    URL.revokeObjectURL(
        url
    );

}

export function gerarRemessaId() {

    const ano =
        new Date().getFullYear();

    const numero =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `REM-${ano}-${numero}`;

}

export function gerarVolumeCodigo(
    remessaId,
    volume
) {

    return `${remessaId}-VOL-${String(
        volume
    ).padStart(3, "0")}`;

}
