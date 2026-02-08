using Mypaws.Domain.Entities;

namespace Mypaws.Application.Interfaces;

public interface IPaymentGatewayService
{
    Task<(string OrderId, string KeyId, decimal Amount)> CreateOrderAsync(decimal amount, string currency, string receipt, Dictionary<string, string>? notes = null);
    bool VerifySignature(string orderId, string paymentId, string signature);
}
