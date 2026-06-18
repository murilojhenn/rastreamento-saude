import {
    db,
    collection,
    onSnapshot
} from "./firebase.js";

import {
    formatarData
} from "./utils.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        carregarAuditoria();
    }
);

function carregarAuditoria() {

    const tabela =
        document.getElementById(
            "auditoriaTabela"
        );

    if (!tabela) return;

    onSnapshot(
        collection(
            db,
            "auditoria"
        ),
        (snapshot) => {

            const registros = [];

            snapshot.forEach((doc) => {
                registros.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            registros.sort(
                (a, b) =>
                    (b.data || 0) -
                    (a.data || 0)
            );

            if (!registros.length) {

                tabela.innerHTML =
                    `<tr><td colspan="6">Nenhuma auditoria registrada.</td></tr>`;

                return;

            }

            tabela.innerHTML =
                registros
                    .map(
                        (item) => `
                            <tr>
                                <td>${formatarData(item.data)}</td>
                                <td>${item.usuario || "-"}</td>
                                <td>${item.codigoFuncionario || "-"}</td>
                                <td>${item.perfil || "-"}</td>
                                <td>${item.acao || "-"}</td>
                                <td>${item.detalhes || "-"}</td>
                            </tr>
                        `
                    )
                    .join("");

        },
        (erro) => {

            console.error(erro);

            tabela.innerHTML =
                `<tr><td colspan="6">Erro ao carregar auditoria.</td></tr>`;

        }
    );

}
