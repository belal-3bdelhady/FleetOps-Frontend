import {
    COD_COLLECTION_FILTERS,
    COD_HANDOVER_FILTERS,
    codRecordsSeed,
} from "../storage/cod-management.js";

const codRecords = clone(codRecordsSeed);

function getRecords() {
    return clone(codRecords);
}

function getRecordById(recordId) {
    return clone(codRecords.find((record) => record.id === recordId) ?? null);
}

function getCollectionFilters() {
    return [...COD_COLLECTION_FILTERS];
}

function getHandoverFilters() {
    return [...COD_HANDOVER_FILTERS];
}

function markHandedOver(recordId) {
    const target = codRecords.find((record) => record.id === recordId);
    if (!target || target.collectedAmount <= 0) {
        return clone(target ?? null);
    }

    target.handoverStatus = "Handed Over";
    target.handedOverAt = target.handedOverAt || "Apr 14, 04:10 PM";
    target.receivedBy = target.receivedBy || "Finance - Mariam Fawzy";
    target.receiptNumber = target.receiptNumber || `REC-${8000 + Number(recordId.split("-")[1])}`;

    return clone(target);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const CodManagementApi = {
    getCollectionFilters,
    getHandoverFilters,
    getRecordById,
    getRecords,
    markHandedOver,
};

export default CodManagementApi;
