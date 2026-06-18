import {
    db,
    collection,
    onSnapshot
} from "./firebase.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarDashboard();

    }
);

function iniciarDashboard() {

    onSnapshot(
        collection(
            db,
            "volumes"
        ),
        (snapshot) => {

            const volumes = [];

            snapshot.forEach((doc) => {

                volumes.push({
                    id: doc.id,
                    ...doc.data()
                });

            });

            atualizarDashboard(
                volumes
            );

        }
    );

}

function atualizarDashboard(
    volumes
) {

    const totalVolumes =
        volumes.length;

    const totalTransporte =
        volumes.filter(
            (v) =>
                v.status ===
                "EM_TRANSPORTE"
        ).length;

    const totalEntregues =
        volumes.filter(
            (v) =>
                v.status ===
                "ENTREGUE"
        ).length;

    const totalDescartados =
        volumes.filter(
            (v) =>
                v.status ===
                "DESCARTADO"
        ).length;

    const totalPendencias =
        volumes.filter(
            (v) =>
                v.status !==
                "ENTREGUE" &&
                v.status !==
                "DESCARTADO"
        ).length;

    const remessasUnicas =
        new Set(
            volumes.map(
                (v) =>
                    v.remessaId
            )
        );

    atualizarCard(
        "totalRemessas",
        remessasUnicas.size
    );

    atualizarCard(
        "totalVolumes",
        totalVolumes
    );

    atualizarCard(
        "totalTransporte",
        totalTransporte
    );

    atualizarCard(
        "totalEntregues",
        totalEntregues
    );

    atualizarCard(
        "totalDescartados",
        totalDescartados
    );

    atualizarCard(
        "totalPendencias",
        totalPendencias
    );

    atualizarMovimentacoes(
        volumes
    );

    atualizarDivergencias(
        volumes
    );

}

function atualizarCard(
    id,
    valor
) {

    const el =
        document.getElementById(
            id
        );

    if (!el) return;

    el.textContent =
        valor;

}

function atualizarMovimentacoes(
    volumes
) {

    const container =
        document.getElementById(
            "ultimasMovimentacoes"
        );

    if (!container)
        return;

    const lista =
        [...volumes]
            .sort(
                (a, b) =>
                    (b.chegadaEm || 0) -
                    (a.chegadaEm || 0)
            )
            .slice(0, 10);

    if (!lista.length) {

        container.innerHTML =
            "<p>Nenhuma movimentação encontrada.</p>";

        return;

    }

    container.innerHTML =
        lista
            .map(
                (v) => `
            <div class="mov-item">
                <strong>${v.codigo}</strong>
                <br>
                Status:
                ${v.status}
            </div>
        `
            )
            .join("");

}

function atualizarDivergencias(
    volumes
) {

    const container =
        document.getElementById(
            "listaDivergencias"
        );

    if (!container)
        return;

    const divergencias =
        volumes.filter(
            (v) =>
                v.status ===
                "EM_TRANSPORTE"
        );

    if (
        !divergencias.length
    ) {

        container.innerHTML =
            `
            <div class="ok-box">
                Nenhuma divergência encontrada.
            </div>
        `;

        return;

    }

    container.innerHTML =
        divergencias
            .map(
                (v) => `
            <div class="warn-box">
                ${v.codigo}
                ainda não recebeu confirmação de chegada.
            </div>
        `
            )
            .join("");

}
