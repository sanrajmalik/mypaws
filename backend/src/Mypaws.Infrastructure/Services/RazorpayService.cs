using Microsoft.Extensions.Configuration;
using Mypaws.Application.Interfaces;
using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;

namespace Mypaws.Infrastructure.Services;

public class RazorpayService : IPaymentGatewayService
{
    private readonly string _keyId;
    private readonly string _keySecret;

    public RazorpayService(IConfiguration configuration)
    {
        _keyId = configuration["Razorpay:KeyId"] ?? throw new ArgumentNullException("Razorpay:KeyId is missing");
        _keySecret = configuration["Razorpay:KeySecret"] ?? throw new ArgumentNullException("Razorpay:KeySecret is missing");
    }

    public async Task<(string OrderId, string KeyId, decimal Amount)> CreateOrderAsync(decimal amount, string currency, string receipt, Dictionary<string, string>? notes = null)
    {
        // Razorpay expects amount in paise (multiply by 100)
        var amountInPaise = (long)(amount * 100);

        var options = new Dictionary<string, object>
        {
            { "amount", amountInPaise },
            { "currency", currency },
            { "receipt", receipt },
            { "payment_capture", 1 } // Auto capture
        };

        if (notes != null)
        {
            options.Add("notes", notes);
        }

        var client = new RazorpayClient(_keyId, _keySecret);
        
        // Use Task.Run because RazorpayClient is synchronous
        var order = await Task.Run(() => client.Order.Create(options));
        
        return (order["id"].ToString(), _keyId, amount);
    }

    public bool VerifySignature(string orderId, string paymentId, string signature)
    {
        string payload = $"{orderId}|{paymentId}";
        return VerifySignatureInternal(payload, signature, _keySecret);
    }

    private static bool VerifySignatureInternal(string payload, string expectedSignature, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.ASCII.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.ASCII.GetBytes(payload));
        var actualSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
        return actualSignature == expectedSignature;
    }
}
