export const MOCK_DISPUTES = [
  {
    id: "disp_1001",
    customerName: "Alice Wonderland",
    orderId: "ord_8832",
    date: "2023-10-14T09:00:00Z",
    amount: "$1,299.00",
    claimType: "Item Not Received",
    email: `Hello, I ordered a Macbook Pro on October 10th but I never got it. Tracking says it was delivered yesterday but my porch was empty. I need my money back immediately. This is ridiculous.`
  },
  {
    id: "disp_1002",
    customerName: "Bob Builder",
    orderId: "ord_9941",
    date: "2023-10-15T14:30:00Z",
    amount: "$49.99",
    claimType: "Fraudulent Charge",
    email: `I did not make this purchase for a "Premium Toolkit". My card was stolen and this charge showed up on my statement. Please refund.`
  },
  {
    id: "disp_1003",
    customerName: "Charlie Delta",
    orderId: "ord_7710",
    date: "2023-10-18T10:15:00Z",
    amount: "$345.50",
    claimType: "Item Not Received",
    email: `Tracking says delivered but I haven't seen it.`
  },
  {
    id: "disp_1004",
    customerName: "Diana Prince",
    orderId: "ord_5521",
    date: "2023-10-20T08:45:00Z",
    amount: "$899.00",
    claimType: "Defective Product",
    email: `The desk arrived with a huge scratch on the side.`
  }
];

export async function getOrderStatus(orderId: string) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));
  
  if (orderId === "ord_8832") {
    return {
      status: "Delivered",
      date: "2023-10-13",
      items: ["Macbook Pro 14-inch"]
    };
  } else if (orderId === "ord_9941") {
    return {
      status: "Processing",
      date: "2023-10-15",
      items: ["Premium Toolkit"]
    };
  }
  return { status: "Unknown", items: [] };
}

export async function getTrackingInfo(orderId: string) {
  await new Promise(r => setTimeout(r, 600));
  
  if (orderId === "ord_8832") {
    return {
      courier: "FedEx",
      trackingNumber: "FX-883299102",
      deliveryDate: "2023-10-13T16:45:00Z",
      signedBy: "A. WONDERLAND",
      proofOfDelivery: "Signature Matched"
    };
  }
  return { error: "No tracking found" };
}

export async function getPaymentRisk(orderId: string) {
  await new Promise(r => setTimeout(r, 700));
  
  if (orderId === "ord_9941") {
    return {
      cvcCheck: "Match",
      avsCheck: "Match",
      ipAddress: "192.168.1.1 (Customer Known IP)",
      riskScore: 12,
      authMethod: "3D Secure Verified"
    };
  } else if (orderId === "ord_8832") {
    return {
      cvcCheck: "Match",
      avsCheck: "Match",
      ipAddress: "10.0.0.5",
      riskScore: 5,
      authMethod: "Standard"
    };
  }
  return { error: "No payment data" };
}
