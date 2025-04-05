#include <string>
#include <map>

// some definition:
struct PstErti
{

    static PstErti *instance;

    std::string name = "PstErti";
    std::string gender = "M";
    std::string birthday = "2008/10/13";

    const bool isSensitive = true;
    const bool isReflective = true;

    static std::map<std::string, std::string> contactInfo;

    PstErti() = default;

    PstErti(const PstErti &) = delete;
    PstErti &operator=(const PstErti &) = delete;

    static PstErti *getInstance()
    {
        if (!instance)
        {
            instance = new PstErti();
        }
        return instance;
    }

    // ...
};

PstErti *PstErti::instance = nullptr;

int main()
{
    PstErti *myself = PstErti::getInstance();
    return 0;
}